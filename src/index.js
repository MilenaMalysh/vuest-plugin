import css from 'css'

const VuestPlugin = {
  install(Vue) {
    Vue.prototype.$updateDynamicCss = function () {
      // data can only be injected into scoped css
      if (this.$options._scopeId) {
        const styleTags = document.querySelectorAll('style');
        const styleReferences = {};

        for (let i = 0; i < styleTags.length; i++) {
          const styleTag = styleTags[i];

          // looking for the scoped styles of the component
          if (css.parse(styleTag.innerText).stylesheet.rules[0].selectors[0].endsWith(`[${this.$options._scopeId}]`)) {
            // iterating over css rules and storing rules containing references to component's data
            for (let rule of css.parse(styleTag.innerText).stylesheet.rules) {
              if (rule.type === 'rule') {
                for (let declaration of rule.declarations) {
                  if (RegExp(/"{{.*}}"/).test(declaration.value)) {
                    let isPresentedInModel = false;
                    for (let componentVal of Object.keys(this.$data).concat(Object.keys(this.$options.computed))) {
                      if (RegExp(`"{{${componentVal}}}"`).test(declaration.value)) {
                        isPresentedInModel = true;
                        const selector = rule.selectors[0];

                        // store found selectors to data-reference map
                        styleReferences[componentVal] = styleReferences[componentVal] || {};
                        styleReferences[componentVal][i] = styleReferences[componentVal][i] || {};
                        styleReferences[componentVal][i][selector] = styleReferences[componentVal][i][selector] || {};
                        styleReferences[componentVal][i][selector][declaration.property] = declaration.value;
                      }
                    }
                    if (!isPresentedInModel) {
                      const value = declaration.value.match(/{{(.*)}}/)[1];
                      throw new Error(`Value "${value}" is not defined on the instance but referenced in scoped css`)
                    }
                  }
                }
              }
            }
          }
        }

        // adding watchers to referred data
        for (let reference of Object.keys(styleReferences)) {
          this.$watch(reference, function (newValue) {
            for (let styleTagIdx of Object.keys(styleReferences[reference])) {
              for (let rule of Object.keys(styleReferences[reference][styleTagIdx])) {

                const cssRuleLink = [...styleTags[styleTagIdx].sheet.cssRules].find(function (r) {
                  return r.selectorText === rule
                });
                const ruleLink = [...styleTags[styleTagIdx].sheet.rules].find(function (r) {
                  return r.selectorText === rule
                });

                for (let property of Object.keys(styleReferences[reference][styleTagIdx][rule])) {
                  const oldPropertyValue = styleReferences[reference][styleTagIdx][rule][property];
                  const newPropertyValue = oldPropertyValue.replaceAll(`"{{${reference}}}"`, newValue);

                  cssRuleLink.style[property] = newPropertyValue;
                  // for IE
                  ruleLink.style[property] = newPropertyValue;
                }
              }
            }
          }, { immediate: true })
        }
      }
    }

    Vue.mixin({
      created() {
        this.$updateDynamicCss()
        if (module.hot) {
          module.hot.addStatusHandler(status => {
            if (status === 'idle') this.$updateDynamicCss()
          })
        }
      }
    })
  }
};
export default VuestPlugin
