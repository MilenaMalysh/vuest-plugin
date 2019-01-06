# Vuest-plugin

## Introduction

Vuest-plugin provides reactive data binding for styles

## Requirements

Vuest-plugin is designed to be used in conjunction with the modified version of [vue-style-plugin](https://github.com/MilenaMalysh/vue-style-loader), which basically adds name of .vue file as an data-vuest-id attribute to it’s \<style\> tag.

## Usage


  ```
  <template>
  	<button class="dynamic-style" @click="switchColor">Change</button>
  </template>
  
  <script>
  export default {
      data: () => ({
          color: 'black'
      }),
      methods: {
          switchColor() {
              this.color = (this.color === 'blue') ? 'black' : 'blue'
          }
      }
  }
  </script>
  
  <style >
  
  .dynamic-style {
    background-color: "{{color}}";
  }
  </style>

  ``` 

For now there is no syntactic analyzer implemented, so it's only possible to set value in "{\<data\>}" format.

## Authors

* **Milena Malysheva** - [MilenaMalysh](https://github.com/MilenaMalysh)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/MilenaMalysh/vuest-plugin/blob/master/LICENSE) file for details

