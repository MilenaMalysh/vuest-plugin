import css from 'css'

const VuestPlugin = {
    install(Vue, options) {
        Vue.mixin({
            mounted: function () {
                if (this.$options.__file) {
                    // remove path and '.vue' from file name
                    let componentFileName = this.$options.__file.substring(0, this.$options.__file.length - 4).split('\\').pop();
                    // convert CamelCase to kebab-case
                    componentFileName = componentFileName.split(/(?=[A-Z])/).join('-').toLowerCase();

                    let styleTag = document.querySelector('[data-vuest-id=' + componentFileName + ']');
                    if (styleTag) {
                        let styleSheet = styleTag.sheet;
                        let styleReferences = {};

                        // iterating over css rules and storing rules containing references to component's data
                        for (let rule of css.parse(styleTag.innerText).stylesheet.rules) {
                            if (rule.type === 'rule') {
                                for (let declaration of rule.declarations) {
                                    if (RegExp('".*{{.*}}.*"').test(declaration.value)) {
                                        let isPresentedInModel = false;
                                        for (let componentVar of Object.keys(this.$data)) {
                                            if (RegExp('^"[^{]*{{' + componentVar + '}}[^}]*"$').test(declaration.value)) {
                                                isPresentedInModel = true;
                                                let selector = rule.selectors[0];

                                                let startStr = declaration.value.match('[^"]*{{')[0];
                                                startStr = startStr.substring(0, startStr.length - 2);
                                                let endStr = declaration.value.match('}}[^"]*')[0].substring(2);

                                                // store found selectors to data-reference map
                                                if (styleReferences[componentVar]) {
                                                    if (styleReferences[componentVar][selector]) {
                                                        styleReferences[componentVar][selector][declaration.property] = [startStr, endStr]
                                                    } else {
                                                        styleReferences[componentVar][selector] = {[declaration.property]: [startStr, endStr]}
                                                    }
                                                } else {
                                                    styleReferences[componentVar] = {[selector]: {[declaration.property]: [startStr, endStr]}}
                                                }
                                            }
                                        }
                                        if (!isPresentedInModel) {
                                            let substrFound = declaration.value.match('{{.*}}')[0];
                                            throw new Error('Property or method "' + substrFound.substring(2, substrFound.length - 2) +
                                                '" is not defined on the instance but referenced in css')
                                        }
                                    }
                                }
                            }
                        }
                        // adding watchers to referred data
                        for (let reference in styleReferences) {
                            if (styleReferences.hasOwnProperty(reference)) {
                                for (let selector in styleReferences[reference]) {
                                    if (styleReferences[reference].hasOwnProperty(selector)) {
                                        // looking for rule index in CSSRules Array
                                        let ruleIndex;
                                        for (let i = 0; i < styleSheet.cssRules.length; i++) {
                                            if (styleSheet.cssRules[i].selectorText === selector) {
                                                ruleIndex = i;
                                                break
                                            }
                                        }
                                        // renaming the key
                                        delete Object.assign(styleReferences[reference],
                                            {[ruleIndex]: styleReferences[reference][selector]})[selector]
                                    }
                                }
                                this.$watch(reference, function (newValue) {
                                    for (let rule in styleReferences[reference]) {
                                        if (styleReferences[reference].hasOwnProperty(rule)) {
                                            for (let property in styleReferences[reference][rule]) {
                                                if (styleReferences[reference][rule].hasOwnProperty(property)) {
                                                    let valueToAssign = styleReferences[reference][rule][property][0] +
                                                        newValue + styleReferences[reference][rule][property][1];
                                                    styleSheet.cssRules[rule].style[property] = valueToAssign;
                                                    // for IE
                                                    styleSheet.rules[rule].style[property] = valueToAssign
                                                }
                                            }
                                        }
                                    }
                                }, {immediate: true})
                            }
                        }
                    }
                }
            }
        })
    }
};
export default VuestPlugin

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(VuestPlugin)
}
