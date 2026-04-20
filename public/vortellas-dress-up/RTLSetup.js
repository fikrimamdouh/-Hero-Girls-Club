// PlayCanvas RTLSetup.js v0.1
var rtlReorder = function (symbols) {
    // Convert array of symbols to codepoints
    var codes = symbols.map(function (s) {
        return s.codePointAt(0);
    });

    // resolve levels and generate mapping
    var levels = UnicodeBidirectional.resolve(codes, 0, true);
    var indices = UnicodeBidirectional.reorderPermutation(levels);
    var rtl = (levels[0] === 1);

    return {
        rtl: rtl,
        mapping: rtl ? indices.reverse() : indices
    };
};

var app = pc.Application.getApplication();

// Unicode Converter takes the original unicode string and transforms into a different set of unicode charactesr
// In the case of arabic, we convert the unicode input string which contains the regular arabic alphabet and
// converts it into the "presentation forms" which are the characters that are specific to the location in the word
app.systems.element.registerUnicodeConverter(arabicConverter.convertArabic);

// register function for calculating bidi mapping
app.systems.element.registerRtlReorder(rtlReorder);