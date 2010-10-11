using System;
using System.Collections.Generic;

namespace fsm
{
    public class FSM<TInput>
    {
        public FSM()
        {
            states = new Dictionary<string, State>();
            current = State.NullState;
        }

        public string CurrentState { get { return current.Name; } }
        public bool Finished { get { return current.Transitions.Count == 0; } }

        public void Step()
        {
            Step(default(TInput));
        }
        
        public void Step(TInput input)
        {
            foreach (var transition in current.Transitions)
            {
                if(!transition.Condition(input)) continue;
                current.OnExit(input);
                transition.Action(input);
                current = states[transition.ToState];
                current.OnEnter(input);
            }
        }

        public void AddState(string name)
        {
            AddState(name, NullAction);
        }

        public void AddState(string name, Action<TInput> onEnter)
        {
            AddState(name, onEnter, NullAction);
        }

        public void AddState(string name, Action<TInput> onEnter, Action<TInput> onExit)
        {
            var state = new State { Name = name, OnEnter = onEnter, OnExit = onExit };
            if(states.Count == 0) current = state;
            states.Add(state.Name, state);
        }

        public void AddTransition(string from, string to, Predicate<TInput> condition)
        {
            AddTransition(from, to, condition, NullAction);
        }

        public void AddTransition(string from, string to, Predicate<TInput> condition, Action<TInput> action)
        {
            states[from].Transitions.Add(new Transition { ToState = to, Condition = condition, Action = action });
        }

        private State current;
        private readonly Dictionary<string, State> states;
        private static void NullAction(TInput input) { }

        private class State
        {
            public static readonly State NullState = new State { Name = string.Empty };
            public string Name;
            public Action<TInput> OnEnter = NullAction;
            public readonly List<Transition> Transitions = new List<Transition>();
            public Action<TInput> OnExit = NullAction;
        }

        private class Transition
        {
            public Predicate<TInput> Condition;
            public string ToState;
            public Action<TInput> Action = NullAction;
        }

    }
}
