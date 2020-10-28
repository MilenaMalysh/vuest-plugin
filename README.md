# Vuest-plugin

## Introduction

Vuest-plugin provides reactive data binding for the scoped styles. It helps to separate Vue templates from the styles and allows them to be dynamically changed based on the component state.

## Installation

Install the plugin:
```bash
$ npm install vuest-plugin
```

And use the plugin by calling the Vue.use():
```javascript
import Vue from 'vue';
import VuestPlugin from 'vuest-plugin';

Vue.use(VuestPlugin);
```

## Usage

Values that can be used in the css rules:
 * data properties
     ```vue
     <template>
        <button class="dynamic-style" @click="switchColor">Change</button>
     </template>
       
     <script>
       export default {
         data: () => ({
           color: 'black'
         }),
         methods: {
           switchColor () {
             this.color = (this.color === 'blue') ? 'black' : 'blue'
           }
         }
       }
     </script>
       
     <style scoped>
       
       .dynamic-style {
         background-color: "{{color}}";
       }
     </style>
     
     ``` 
 
 * computed properties

     ```vue
     <script>
       export default {
         data: () => ({
           time: 3
         }),
         computed: {
           multiplier () {
             return (this.time - 3) / 6
           }
         }
       }
     </script>
       
     <style scoped>
       /*...*/
       .sun {
           height: calc(("{{multiplier}}" + 1) * 150px);
           width: calc(("{{multiplier}}" + 1) * 150px);
           background-color: rgb(
                   252,
                   calc(249 - "{{multiplier}}" * 220 ),
                   calc(129 - "{{multiplier}}" * 100 )
           );
           border-radius: 50%;
           top: calc("{{multiplier}}" * 60%);
         }
      /*...*/
     </style>
     
     ``` 

## Demo

![](examples/demo1.gif)

## Authors

* **Milena Malysheva** - [MilenaMalysh](https://github.com/MilenaMalysh)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/MilenaMalysh/vuest-plugin/blob/master/LICENSE) file for details

