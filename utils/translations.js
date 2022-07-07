const DEFAULT_LANG = 'en';

function getTranslationFunction({ langs, names, translations, langsFolderPath }) {
    return function getTranslation(name, language = DEFAULT_LANG) {
        if (!langs.includes(language)) {
            console.log("Language " + language + " not available for translations in " + langsFolderPath);
            if (language == DEFAULT_LANG) {
                return "No Translation available";
            }
            if (!langs.includes(DEFAULT_LANG)) {
                console.log("Default language " + language + " not available for translations in " + langsFolderPath);
                return "No Translation available";
            } else {
                language = DEFAULT_LANG;
            }
        }
    
        if (!names[name]) {
            console.log("Name " + name + " not available for translations in " + langsFolderPath);
            return "No Translation available";
        }
    
        if (translations[language][name]) {
            return translations[language][name]
        } else {
            return "No Translation available";
        }
    }
}

function getLanguages(originFilePath) {
    var langs = null;
    var names = null;
    var translations = {};
    var langsFolderPath = null;

    // Verify originating file path is provided
    if (!originFilePath) {
        console.log("Must supply filePath of file using translations. Pass __filename, to the function returned by require.");
        return null;
    }
    langsFolderPath = originFilePath + '.meta/languages/';

    // Get current languages supported for this file
    langs = require(langsFolderPath + 'langs.js');
    if (!langs) {
        console.log("No langs.js file available for the file to be translated: " + langsFolderPath);
        return null;
    }

    // Get available names
    names = require(langsFolderPath + 'names.js');
    if (!names) {
        console.log("No names.js file available for the file to be transtlated: " + langsFolderPath);
        return null;
    }

    // Load translations
    langs.forEach(function(value){
        translations[value] = require(langsFolderPath + value + '.js');
    });

    return getTranslationFunction({ langs, names, translations, langsFolderPath });
}


module.exports = getLanguages;