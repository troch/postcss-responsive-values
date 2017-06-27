import postcss from 'postcss';
import test from 'ava';
import plugin from './';

const input = `
.a {
    margin-top: rv(whitespace);
    padding: rv(whitespaceSmall) rv(whitespace) 0;
}
`;
const output = `
.a {
    margin-top: 1.6rem;
    padding: 1rem 1.6rem 0;
}
@media (min-width: 640px) {
.a {
    margin-top: 2rem;
    padding: 1.4rem 2rem 0;
}
}
`;
const options = {
    values: {
        whitespaceSmall: {
            value: '1rem',
            queries: {
                '(min-width: 640px)': '1.4rem'
            }
        },
        whitespace: {
            value: '1.6rem',
            queries: {
                '(min-width: 640px)': '2rem'
            }
        }
    }
}

function run(t, input, output, opts = {}) {
    return postcss([ plugin(opts) ]).process(input)
        .then( result => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
}

test('does something', t => {
    return run(t, input, output, options);
});

