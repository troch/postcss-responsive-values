# postcss-responsive-values

[PostCSS] Responsive values

[PostCSS]: https://github.com/postcss/postcss

```css
.my-class-name {
    margin-top: responsive(whitespaceBase);
    padding: responsive(whitespaceSmall) responsive(whitespaceBase) 0;
}
```
Will output (see Usage below)

```css
.my-class-name {
    margin-top: 1.6rem;
    padding: 1rem 1.6rem 0;
}
@media (min-width: 640px) {
    .a {
        margin-top: 2rem;
        padding: 1.4rem 2rem 0;
    }
}
```

## Usage

In your CSS, wrap responsive values names with `rv()` or `responsive()`. Each responsive value needs to be defined with:
- `value`: a default value
- `queries`: a map of media queries params -> responsive value

If you use multiple responsive values on a same rule declaration, then their media queries need to match or an exception will be thrown.

```js
var responsiveValues = require('postcss-responsive-values');
var values = {
    whitespaceSmall: {
        value: '1rem',
        queries: {
            '(min-width: 640px)': '1.4rem'
        }
    },
    whitespaceBase: {
        value: '1.6rem',
        queries: {
            '(min-width: 640px)': '2rem'
        }
    }
}

postcss([ responsiveValues({ values: values }) ])
```

## Variables

You can use this plugin with variables, just make sure you place this plugin before the postcss variable plugin you use.

See [PostCSS] docs for examples for your environment.
