var postcss = require('postcss');
var valueParser = require('postcss-value-parser');
var equals = require('is-equal-shallow');

var funcNameTest = /^(rv|responsive)$/;

module.exports = postcss.plugin('postcss-responsive-values', function (opts) {
    opts = opts || {};

    return function (css, result) {
        css.walk(function (node) {
            var parsedValues;
            var responsiveValues;

            if ( node.type === 'decl' ) {
                parsedValues = markResponsiveValues(valueParser(node.value));
                responsiveValues = filterResponsiveValues(parsedValues);

                if (responsiveValues.length) {
                    checkResponsiveValuesValid(node, responsiveValues, opts);
                    transform(node, parsedValues, opts);
                }
            }
        });
    };
});

function checkResponsiveValuesValid(node, responsiveValues, opts) {
    if (!opts.values) {
        throw node.error('No values configured in options for postcss-responsive-values plugin');
    }

    responsiveValues.forEach(function (value) {
        var valueKey = value.nodes[0].value;

        if (!opts.values[valueKey]) {
            throw node.error('Missing configuration for responsive value "' + valueKey + '"')
        }
    });

    if (responsiveValues.length === 1) {
        return;
    }

    var firstValueQueries = getQueries(responsiveValues[0], opts);
    var compatibleQueries = responsiveValues
        .slice(1)
        .every(function (value) {
            return equals(firstValueQueries, getQueries(value, opts));
        });

    if (!compatibleQueries) {
        throw node.error('You have responsive values with non matching media queries on the same declaration');
    }

    return compatibleQueries;
}

function transform(node, parsedValues, opts) {
    var queries = getQueries(filterResponsiveValues(parsedValues)[0], opts);

    node.value = buildValue(node, parsedValues, null, opts);

    queries.map(function (query) {
        var declNode = node.clone({
            value: buildValue(node, parsedValues, query, opts)
        });

        var existingMediaNode = findMediaNode(node.parent.parent, query);
        var mediaNode = existingMediaNode ||
            postcss.atRule({
                name: 'media',
                params: query
            });

        var existingRuleNode = findRuleNode(mediaNode, node.parent);
        var ruleNode = existingRuleNode ||
            node.parent.clone({ nodes: [] })

        ruleNode.append(declNode);

        if (!existingRuleNode) {
            mediaNode.append(ruleNode);
        }

        if (!existingMediaNode) {
            node.parent.parent.append(mediaNode);
        }
    });
}

function findRuleNode(parentNode, node) {
    var nodes = (parentNode.nodes || []).filter(function (n) {
        return n.type === node.type && n.selector === node.selector;
    });

    return nodes[0];
}

function findMediaNode(node, query) {
    var nodes = node.nodes.filter(function (n) {
        return n.type === 'atrule' && n.name === 'media' &&
            n.params === query;
    });

    return nodes[0];
}

function buildValue(node, parsedValues, query, opts) {
    var semicolon = node.parent.raws.semicolon;
    return parsedValues.map(function (nodeValue) {
        return !nodeValue.hasRespFunc ? nodeValue.value : getValue(nodeValue, query, opts);
    }).join('');
}

function getValue(nodeValue, query, opts) {
    var valueKey = nodeValue.nodes[0].value;

    return query
        ? opts.values[valueKey].queries[query]
        : opts.values[valueKey].value;
}

function markResponsiveValues(parsedValues) {
    return parsedValues.nodes.map(function (node) {
        node.hasRespFunc = node.type === 'function' && funcNameTest.test(node.value) &&
            node.nodes.length === 1 && node.nodes[0].type === 'word';

        return node;
    });
}

function filterResponsiveValues(parsedValues) {
    return parsedValues.filter(function (value) {
        return value.hasRespFunc;
    });
}

function getQueries(valueNode, opts) {
    var value = valueNode.nodes[0].value;

    return (Object.keys(opts.values[value].queries) || []);
}
