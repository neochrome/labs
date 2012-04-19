using System;
using System.Linq;
using System.Text.RegularExpressions;
[assembly: System.Reflection.AssemblyTitle("colorize")]
[assembly: System.Reflection.AssemblyDescription("")]

class Colorize
{
	static int Main(string[] args)
	{
		try
		{
			var patterns = args
				.Where(x => !x.StartsWith("--"))
				.Select(x => new Regex(x))
				.ToList();
			var colors = args
				.Where(x => x.StartsWith("--"))
				.Select(x => x.TrimStart('-').Split('='))
				.ToDictionary(
					x => x[0],
					x => {
						var fgbg = x[1].Split(';');
						Func<string, ConsoleColor> parse = color => (ConsoleColor)Enum.Parse(typeof(ConsoleColor), color, true);
						return new { Color = parse(fgbg[0]), Background = fgbg.Length == 2 ? (ConsoleColor?)parse(fgbg[1]) : null };
					});

			string line;
			while((line = Console.In.ReadLine()) != null)
			{
				patterns.ForEach(pattern => {
					line = pattern.Replace(line, match => Enumerable.Range(0, match.Groups.Count).Select(pattern.GroupNameFromNumber).Select(g => colors[g].Color.ToString()).First() );
				});
				Console.WriteLine();
			}

			return 0;
		}
		catch (Exception ex)
		{
			Console.Error.WriteLine("Error:");
			Console.Error.WriteLine(ex.Message);
			return 1;
		}
		finally
		{
		}
	}
}
