using NUnit.Framework;

namespace fsm
{
    [TestFixture]
    public class FSMTests
    {
        [Test]
        public void ShouldBeFinishedWhenEmpty()
        {
            var fsm = new FSM<string>();
            Assert.That(fsm.Finished, Is.True);
        }

        [Test]
        public void ShouldBeFinishedWhenCurrentStateHasNoTransitions()
        {
            var fsm = new FSM<string>();
            fsm.AddState("a state");
            Assert.That(fsm.Finished, Is.True);
        }

        [Test]
        public void ShouldNotBeFinishedWhenCurrentHasTransitions()
        {
            var fsm = new FSM<string>();
            fsm.AddState("one");
            fsm.AddState("two");
            fsm.AddTransition("one", "two", input => true);
            Assert.That(fsm.Finished, Is.False);
        }

        [Test]
        public void ShouldNotExecuteOnEnterWhenInInitialState()
        {
            var fsm = new FSM<string>();
            var onEnter = false;
            fsm.AddState("initial", input => onEnter = true);

            fsm.Step();
            
            Assert.That(onEnter, Is.False);
        }

        [Test]
        public void ShouldEvaluateTransitionCondition()
        {
            var conditionEvaluated = false;
            var fsm = new FSM<string>();
            fsm.AddState("initial");
            fsm.AddState("end");
            fsm.AddTransition("initial", "end", input => { conditionEvaluated = true; return false; });

            fsm.Step();

            Assert.That(conditionEvaluated, Is.True);
        }

        [Test]
        public void ShouldStartAtFirstState()
        {
            var fsm = new FSM<string>();
            fsm.AddState("initial");
            fsm.AddState("end");

            Assert.That(fsm.CurrentState, Is.EqualTo("initial"));
        }

        [Test]
        public void ShouldFollowTransitionIfConditionIsMet()
        {
            var fsm = new FSM<string>();
            fsm.AddState("start");
            fsm.AddState("exit");
            fsm.AddTransition("start", "exit", input => true);

            fsm.Step();

            Assert.That(fsm.CurrentState, Is.EqualTo("exit"));
        }

        [Test]
        public void ShouldExecuteOnEnterWhenEnteringNextState()
        {
            var exit_here = false;
            var fsm = new FSM<string>();
            fsm.AddState("start_here");
            fsm.AddState("exit_here", input => exit_here = true);
            fsm.AddTransition("start_here", "exit_here", input => true);

            fsm.Step();

            Assert.That(exit_here, Is.True);

        }
        
        [Test]
        public void ShouldExecuteOnExitWhenLeavingCurrentState()
        {
            var was_here = false;
            var fsm = new FSM<string>();
            fsm.AddState("start_here", null, input => was_here = true);
            fsm.AddState("exit_here");
            fsm.AddTransition("start_here", "exit_here", input => true);

            fsm.Step();

            Assert.That(was_here, Is.True);
        }

        [Test]
        public void ShouldEvaluateMultipleTransitionsUntilConditionIsMet()
        {
            var fsm = new FSM<string>();
            fsm.AddState("one");
            fsm.AddState("two");
            fsm.AddState("three");
            fsm.AddTransition("one", "two", input => false);
            fsm.AddTransition("one", "three", input => true);

            fsm.Step();

            Assert.That(fsm.CurrentState, Is.EqualTo("three"));
        }

        [Test]
        public void ShouldExecuteTransitionAction()
        {
            var action = false;
            var fsm = new FSM<string>();
            fsm.AddState("first");
            fsm.AddState("second");
            fsm.AddTransition("first", "second", input => true, input => action = true);

            fsm.Step();

            Assert.That(action, Is.True);
        }

    }
}