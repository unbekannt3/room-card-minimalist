# Language Support

We welcome translation contributions! The process is simple and uses GitHub's standard fork and pull request workflow.

## Adding a New Language

To add a new language, simply copy the English template and translate it:

1. **Fork this repository** on GitHub
2. **Create a branch** with a descriptive name like `translation-fr` or `translation-es`
3. **Copy the English template**:
   - Copy `src/localize/locales/en.json`
   - Rename it to your language code (e.g., `fr.json` for French, `es.json` for Spanish)
4. **Translate the values** in your new file (keep the keys in English)
5. Add your Language to the [README](../README.md#supported-languages) for others to know its supported
6. Commit your changes with "**i18n: add [Language] translation**" as commit message
7. **Create a Pull Request** with your translation

### Detailed Step-by-Step Guide

1. **Fork this repository**
   - Click the "Fork" button on GitHub
   - This creates your own copy of the project

2. **Create a translation branch**
   - Name it descriptively: `translation-fr`, `translation-es`, `translation-it`, etc.
   - This helps us identify translation PRs quickly

3. **Copy the English template**
   - Go to `src/localize/locales/`
   - Copy `en.json` and rename it to your language code
   - Use [ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes): `fr.json`, `es.json`, `it.json`, etc.

4. **Translate the content**
   - Translate all the **values** (the text after the colons)
   - Keep all the **keys** (the text before the colons) in English
   - Ensure your JSON syntax is valid

5. **Test your translation** (optional but recommended)
   - Setup a local HomeAssistant instance as described in the README
   - Set your Home Assistant language to your translation language
   - Test the card editor to see how your translations look

6. **Submit your Pull Request**
   - Commit your new language file with message: `i18n: add [Language] translation`
   - Push to your fork
   - Create a Pull Request to the main repository
   - Use a clear title like "i18n: add French translation" or "i18n: add Spanish translation"

### Translation Guidelines

- **Use your language's UI conventions**: Keep it consistent with how Home Assistant displays things in your language
- **Keep it concise**: UI labels should be short and clear
- **Test the length**: Some languages need more space - make sure labels fit in the interface
- **Be consistent**: Use the same terminology throughout your translation
- **Check your JSON**: Use a JSON validator like [JSONLint](https://jsonlint.com/) to ensure your file is syntactically correct

### Example Translation Process

```bash
# 1. Fork on GitHub, then clone your fork
git clone https://github.com/yourusername/room-card-minimalist.git
cd room-card-minimalist

# 2. Create translation branch
git checkout -b translation-fr

# 3. Copy and translate
cp src/localize/locale/en.json src/localize/locale/fr.json
# Edit fr.json with your translations
# Don't forget to edit the README to show your language as supported :)

# 4. Commit and push
git add .
git commit -m "i18n: add French translation"
git push origin translation-fr

# 5. Create Pull Request on GitHub
```
