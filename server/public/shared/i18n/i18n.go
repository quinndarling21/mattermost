// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package i18n

import (
	"fmt"
	"html/template"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"sync"

	"github.com/mattermost/go-i18n/i18n"
	"github.com/mattermost/go-i18n/i18n/bundle"

	"github.com/mattermost/mattermost/server/public/shared/mlog"
)

// mut is used to protect other global variables from concurrent access.
// This should only be a concern in parallel tests.
var mut sync.Mutex

const defaultLocale = "en"

// TranslateFunc is the type of the translate functions
type TranslateFunc func(translationID string, args ...any) string

// TranslationFuncByLocal is the type of function that takes local as a string and returns the translation function
type TranslationFuncByLocal func(locale string) TranslateFunc

var (
	t        TranslateFunc
	tDefault TranslateFunc
)

// T is the translate function using the default server language as fallback language
var T TranslateFunc = func(translationID string, args ...any) string {
	mut.Lock()
	defer mut.Unlock()

	if t == nil {
		return translationID
	}

	return t(translationID, args...)
}

// TranslationId is a no-op translation implementation for ensuring the string is retained in translation files
var TranslationId TranslateFunc = func(translationID string, args ...any) string {
	return translationID
}

// TDefault is the translate function using english as fallback language
var TDefault TranslateFunc = func(translationID string, args ...any) string {
	mut.Lock()
	defer mut.Unlock()

	if tDefault == nil {
		return translationID
	}

	return t(translationID, args...)
}

var (
	// locales maps locale code -> translation file path for every supported
	// locale found on disk. Presence here does not mean the file has been parsed.
	locales = make(map[string]string)
	// loadedLocales maps locale code -> path of the file that has been parsed
	// into the process-wide bundle. The path is stored so a later init against a
	// different file (tests) reloads instead of treating the locale as done.
	loadedLocales = make(map[string]string)
)

// supportedLocales is a hard-coded list of locales considered ready for production use. It must
// be kept in sync with ../../../../webapp/channels/src/i18n/i18n.jsx.
var supportedLocales = []string{
	"de",
	"en",
	"en-AU",
	"es",
	"fr",
	"it",
	"hu",
	"nl",
	"pl",
	"pt-BR",
	"ro",
	"sv",
	"vi",
	"tr",
	"bg",
	"ru",
	"uk",
	"fa",
	"ko",
	"zh-CN",
	"zh-TW",
	"ja",
}

var (
	defaultServerLocale string
	defaultClientLocale string
)

// TranslationsPreInit indexes translation files and parses English so T() works
// while loading server config. Other locales load on first use.
func TranslationsPreInit(translationsDir string) error {
	mut.Lock()
	defer mut.Unlock()
	if t != nil {
		return nil
	}

	// Set T even if we fail to load the translations. Lots of shutdown handling code will
	// segfault trying to handle the error, and the untranslated IDs are strictly better.
	t = tfuncWithFallback(defaultLocale)
	tDefault = tfuncWithFallback(defaultLocale)

	return initTranslationsWithDir(translationsDir)
}

// TranslationsPreInitFromFileBytes loads translations from a buffer -- useful if
// we need to initialize i18n from an embedded i18n file (e.g., from a CLI tool)
func TranslationsPreInitFromFileBytes(filename string, buf []byte) error {
	mut.Lock()
	defer mut.Unlock()
	if t != nil {
		return nil
	}

	// Set T even if we fail to load the translations. Lots of shutdown handling code will
	// segfault trying to handle the error, and the untranslated IDs are strictly better.
	t = tfuncWithFallback(defaultLocale)
	tDefault = tfuncWithFallback(defaultLocale)

	locale := strings.Split(filename, ".")[0]
	if !isSupportedLocale(locale) {
		return fmt.Errorf("locale not supported: %s", locale)
	}

	locales[locale] = filename
	if err := i18n.ParseTranslationFileBytes(filename, buf); err != nil {
		return err
	}
	loadedLocales[locale] = filename
	return nil
}

// InitTranslations set the defaults configured in the server and initialize
// the T function using the server default as fallback language
func InitTranslations(serverLocale, clientLocale string) error {
	mut.Lock()
	defaultServerLocale = serverLocale
	defaultClientLocale = clientLocale
	if err := loadLocaleLocked(serverLocale); err != nil && serverLocale != defaultLocale {
		// English is already required at TranslationsPreInit; a missing configured
		// locale falls back in GetTranslationsBySystemLocale.
		mlog.Warn("Failed to load configured server locale, will fall back to default", mlog.String("locale", serverLocale), mlog.Err(err))
	}
	if clientLocale != "" && clientLocale != serverLocale {
		if err := loadLocaleLocked(clientLocale); err != nil {
			mlog.Warn("Failed to load configured client locale", mlog.String("locale", clientLocale), mlog.Err(err))
		}
	}
	mut.Unlock()

	tfn, err := GetTranslationsBySystemLocale()

	mut.Lock()
	t = tfn
	mut.Unlock()

	return err
}

func initTranslationsWithDir(dir string) error {
	next := make(map[string]string)
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if filepath.Ext(f.Name()) == ".json" {
			filename := f.Name()

			locale := strings.Split(filename, ".")[0]
			if !isSupportedLocale(locale) {
				continue
			}

			next[locale] = filepath.Join(dir, filename)
		}
	}
	locales = next

	// Only English is parsed during process startup. The remaining locale JSON
	// files are large and unused for most boots; they load on first use.
	return loadLocaleLocked(defaultLocale)
}

// loadLocaleLocked parses a locale file into the process-wide bundle.
// Caller must hold mut.
func loadLocaleLocked(locale string) error {
	if locale == "" {
		return fmt.Errorf("empty locale")
	}
	path, ok := locales[locale]
	if !ok || path == "" {
		return fmt.Errorf("unknown locale %s", locale)
	}
	if loadedLocales[locale] == path {
		return nil
	}
	if err := i18n.LoadTranslationFile(path); err != nil {
		return err
	}
	loadedLocales[locale] = path
	return nil
}

// GetTranslationFuncForDir loads translations from the filesystem into a new instance of the bundle.
// It returns a function to access loaded translations.
func GetTranslationFuncForDir(dir string) (TranslationFuncByLocal, error) {
	availableLocals := make(map[string]string)
	bundle := bundle.New()
	files, _ := os.ReadDir(dir)
	for _, f := range files {
		if filepath.Ext(f.Name()) != ".json" {
			continue
		}

		locale := strings.Split(f.Name(), ".")[0]
		if !isSupportedLocale(locale) {
			continue
		}

		filename := f.Name()
		availableLocals[locale] = filepath.Join(dir, filename)
		if err := bundle.LoadTranslationFile(filepath.Join(dir, filename)); err != nil {
			return nil, err
		}
	}

	return func(locale string) TranslateFunc {
		if _, ok := availableLocals[locale]; !ok {
			locale = defaultLocale
		}

		t, _ := bundle.Tfunc(locale)
		return func(translationID string, args ...any) string {
			if translated := t(translationID, args...); translated != translationID {
				return translated
			}

			t, _ := bundle.Tfunc(defaultLocale)
			return t(translationID, args...)
		}
	}, nil
}

func GetTranslationsBySystemLocale() (TranslateFunc, error) {
	mut.Lock()
	defer mut.Unlock()
	locale := defaultServerLocale
	if _, ok := locales[locale]; !ok {
		mlog.Warn("Failed to load system translations for selected locale, attempting to fall back to default", mlog.String("locale", locale), mlog.String("default_locale", defaultLocale))
		locale = defaultLocale
	}

	if !isSupportedLocale(locale) {
		mlog.Warn("Selected locale is unsupported, attempting to fall back to default", mlog.String("locale", locale), mlog.String("default_locale", defaultLocale))
		locale = defaultLocale
	}

	if locales[locale] == "" {
		return nil, fmt.Errorf("failed to load system translations for '%v'", defaultLocale)
	}

	if err := loadLocaleLocked(locale); err != nil {
		return nil, fmt.Errorf("failed to load system translations for '%v': %w", locale, err)
	}

	translations := tfuncWithFallback(locale)
	if translations == nil {
		return nil, fmt.Errorf("failed to load system translations")
	}

	mlog.Info("Loaded system translations", mlog.String("for locale", locale), mlog.String("from locale", locales[locale]))
	return translations, nil
}

// GetUserTranslations get the translation function for an specific locale
func GetUserTranslations(locale string) TranslateFunc {
	mut.Lock()
	defer mut.Unlock()
	if _, ok := locales[locale]; !ok {
		locale = defaultLocale
	}
	if err := loadLocaleLocked(locale); err != nil {
		locale = defaultLocale
		_ = loadLocaleLocked(locale)
	}

	translations := tfuncWithFallback(locale)
	return translations
}

// GetTranslationsAndLocaleFromRequest return the translation function and the
// locale based on a request headers
func GetTranslationsAndLocaleFromRequest(r *http.Request) (TranslateFunc, string) {
	mut.Lock()
	defer mut.Unlock()
	// This is for checking against locales like pt_BR or zn_CN
	headerLocaleFull := strings.Split(r.Header.Get("Accept-Language"), ",")[0]
	// This is for checking against locales like en, es
	headerLocale := strings.Split(strings.Split(r.Header.Get("Accept-Language"), ",")[0], "-")[0]
	clientDefault := defaultClientLocale
	if locales[headerLocaleFull] != "" {
		_ = loadLocaleLocked(headerLocaleFull)
		return tfuncWithFallback(headerLocaleFull), headerLocaleFull
	} else if locales[headerLocale] != "" {
		_ = loadLocaleLocked(headerLocale)
		return tfuncWithFallback(headerLocale), headerLocale
	} else if locales[clientDefault] != "" {
		_ = loadLocaleLocked(clientDefault)
		return tfuncWithFallback(clientDefault), headerLocale
	}

	_ = loadLocaleLocked(defaultLocale)
	return tfuncWithFallback(defaultLocale), clientDefault
}

// GetSupportedLocales return a map of locale code and the file path with the
// translations
func GetSupportedLocales() map[string]string {
	mut.Lock()
	defer mut.Unlock()
	return locales
}

func tfuncWithFallback(pref string) TranslateFunc {
	t, _ := i18n.Tfunc(pref)
	return func(translationID string, args ...any) string {
		if translated := t(translationID, args...); translated != translationID {
			return translated
		}

		t, _ := i18n.Tfunc(defaultLocale)
		return t(translationID, args...)
	}
}

// TranslateAsHTML translates the translationID provided and return a
// template.HTML object
func TranslateAsHTML(t TranslateFunc, translationID string, args map[string]any) template.HTML {
	message := t(translationID, escapeForHTML(args))
	message = strings.Replace(message, "[[", "<strong>", -1)
	message = strings.Replace(message, "]]", "</strong>", -1)
	return template.HTML(message)
}

func escapeForHTML(arg any) any {
	switch typedArg := arg.(type) {
	case string:
		return template.HTMLEscapeString(typedArg)
	case *string:
		return template.HTMLEscapeString(*typedArg)
	case int:
		return typedArg
	case int64:
		return typedArg
	case float64:
		return typedArg
	case map[string]any:
		safeArg := make(map[string]any, len(typedArg))
		for key, value := range typedArg {
			safeArg[key] = escapeForHTML(value)
		}
		return safeArg
	default:
		mlog.Warn(
			"Unable to escape value for HTML template",
			mlog.Any("html_template", arg),
			mlog.String("template_type", reflect.ValueOf(arg).Type().String()),
		)
		return ""
	}
}

// IdentityTfunc returns a translation function that don't translate, only
// returns the same id
func IdentityTfunc() TranslateFunc {
	return func(translationID string, args ...any) string {
		return translationID
	}
}

func isSupportedLocale(locale string) bool {
	return slices.Contains(supportedLocales, locale)
}
