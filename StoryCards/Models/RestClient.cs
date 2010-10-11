using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;

namespace StoryCards.Models
{
	public class RestClient
	{
		public RestClient WithHeader(HttpRequestHeader header, string value)
		{
			transientHeaders.Add(header, value);
			return this;
		}

		public RestClient WithHeader(string header, string value)
		{
			transientHeaders.Add(header, value);
			return this;
		}

		public RestResponse Get(string url)
		{
			return Request("GET", url, null, null);
		}

		public RestResponse Post(string url, string body, string contentType)
		{
			return Request("POST", url, body, contentType);
		}

		public RestResponse Put(string url, string body, string contentType)
		{
			return Request("PUT", url, body, contentType);
		}

		public RestResponse Delete(string url)
		{
			return Request("DELETE", url, null, null);
		}

		private RestResponse Request(string method, string url, string body, string contentType)
		{
			try
			{
				var request = (HttpWebRequest)WebRequest.Create(url);
				request.Method = method;
				request.Headers.Add(transientHeaders);

				if (body != null)
				{
					request.ContentType = contentType;
					var bodyAsBytes = Encoding.UTF8.GetBytes(body);
					request.ContentLength = bodyAsBytes.Length;
					using (var output = request.GetRequestStream())
					{
						output.Write(bodyAsBytes, 0, bodyAsBytes.Length);
						output.Flush();
					}
				}

				return RestResponse.CreateFrom((HttpWebResponse)request.GetResponse());
			}
			catch (WebException ex)
			{
				if (ex.Status == WebExceptionStatus.ProtocolError)
					return RestResponse.CreateFrom((HttpWebResponse)ex.Response);
				else
					throw new Exception(string.Format("Request failed: {0} - {1}\n{2}", method, url, body), ex);
			}
			finally
			{
				transientHeaders.Clear();
			}
		}

		private readonly WebHeaderCollection transientHeaders = new WebHeaderCollection();
	}

	public class RestResponse
	{
		private RestResponse(HttpStatusCode statusCode, string body, WebHeaderCollection headers)
		{
			StatusCode = statusCode;
			Body = body;
			Headers = headers;
		}

		public static RestResponse CreateFrom(HttpWebResponse response)
		{
			using (var reader = new StreamReader(response.GetResponseStream(), true))
			{
				return new RestResponse(response.StatusCode, reader.ReadToEnd(), response.Headers);
			}
		}

		public override string ToString()
		{
			var sb = new StringBuilder();
			sb.AppendFormat("Status code: {0}", StatusCode);
			sb.AppendLine();
			sb.Append("Headers:");
			sb.AppendLine();
			Headers.AllKeys
				.Select(key => new { name = key, value = Headers[key] })
				.ToList()
				.ForEach(header => sb.AppendFormat("  {0}: {1}", header.name, header.value).AppendLine());
			sb.Append("Body");
			sb.AppendLine();
			sb.Append(Body);
			return sb.ToString();
		}

		public HttpStatusCode StatusCode { get; private set; }
		public string Body { get; private set; }
		public WebHeaderCollection Headers { get; private set; }
	}
}
