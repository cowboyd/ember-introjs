import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';
import { render, waitUntil } from '@ember/test-helpers';
import { introJSNext, introJSSkip } from './../../helpers/ember-introjs'

module('Integration | Component | intro js', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const fixture = document.createElement('div');
    fixture.innerHTML = `
      <div id="introjs-fixture">
        <div id="step1">Foo</div>
        <div id="step2">Bar</div>
      </div>
    `;

    this.element.appendChild(fixture);

    const steps = [
      {
        element: '#step1',
        intro: 'Step 1'
      },
      {
        element: '#step2',
        intro: 'Step 2'
      }
    ];

    this.set('fixture', fixture);
    this.set('steps', steps);
  });

  hooks.afterEach(function() {
    if (this.element) {
      this.element.removeChild(this.element.lastChild);
    }
  })

  module('start-if', function() {
    test('when start-if is falsy does not render the introjs component', async function(assert) {
      assert.expect(1);

      this.set('startIf', false);

      await render(hbs`{{intro-js steps=steps start-if=startIf}}`);

      assert.equal(document.querySelector('.introjs-overlay'), null);
    });

    test('when start-if changes to truthy renders introJS', async function(assert) {
      assert.expect(2);

      this.set('startIf', false);

      await render(hbs`{{intro-js steps=steps start-if=startIf}}`);

      assert.equal(document.querySelector('.introjs-overlay'), null);

      this.set('startIf', true);

      assert.ok(document.querySelector('.introjs-overlay'));
    });

    test('when start-if changes to falsy hides introJS', async function(assert) {
      assert.expect(1);

      this.set('startIf', true);

      await render(hbs`{{intro-js steps=steps start-if=startIf}}`);


      this.set('startIf', false);

      await waitUntil(() => document.querySelectorAll('.introjs-overlay').length === 0);

      assert.equal(document.querySelector('.introjs-overlay'), null);
    });
  });

  module('when existing', function() {
    test('fires the on-exit action', async function(assert) {
      assert.expect(3);

      this.set('myExit', (step) => {
        assert.equal(step, this.steps[0])
      });

      await render(hbs`{{intro-js steps=steps start-if=true on-exit=(action myExit)}}`);

      await introJSSkip();
    })
  });

  module('when skiping', function() {
    test('fires the on-skip action', async function(assert) {
      assert.expect(1);

      this.set('onSkip', (step) => {
        assert.equal(step, this.steps[0])
      });

      await render(hbs`{{intro-js steps=steps start-if=true on-skip=(action onSkip)}}`);

      await introJSSkip();
    })
  });

  module('when completing', function() {
    test('fires the on-complete action', async function(assert) {
      assert.expect(1);

      this.set('myComplete', (step) => {
        assert.equal(step, this.steps[1])
      });

      await render(hbs`{{intro-js steps=steps start-if=true on-complete=(action myComplete)}}`);

      await introJSNext();

      await introJSSkip();
    })
  });

  module('when going to the next step', function() {
    test('fires the on-before-change action', async function(assert) {
      assert.expect(4);
      this.set('beforeChange', (currentStep, nextStep, component, step2) => {
        let introJsComponent = this.owner.lookup('component:intro-js');

        assert.equal(currentStep, this.steps[0]);
        assert.equal(nextStep, this.steps[1]);
        assert.equal(component, introJsComponent);
        assert.equal(step2, this.steps[0].intro);
      });

      await render(hbs`{{intro-js steps=steps start-if=true on-before-change=(action beforeChange)}}`);

      await introJSSkip();
    });

    test('fires the on-after-change action', async function(assert) {
      assert.expect(3);
      this.set('afterChange', (nextStep, component, step2) => {
        let introJsComponent = this.owner.lookup('component:intro-js');

        assert.equal(nextStep, this.steps[1]);
        assert.equal(component, introJsComponent);
        assert.equal(step2, this.steps[0].intro);
      });

      await render(hbs`{{intro-js steps=steps start-if=true on-after-change=(action afterChange)}}`);

      await introJSSkip();
    });

    test('fires the on-change action', async function(assert) {
      assert.expect(3);
      this.set('onChange', (nextStep, component, step2) => {
        let introJsComponent = this.owner.lookup('component:intro-js');

        assert.equal(nextStep, this.steps[1]);
        assert.equal(component, introJsComponent);
        assert.equal(step2, this.steps[0].intro);
      });

      await render(hbs`{{intro-js steps=steps start-if=true on-change=(action onChange)}}`);

      await introJSSkip();
    })
  })
});
