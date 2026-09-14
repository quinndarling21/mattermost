// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package i18n

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/mattermost/go-i18n/i18n/bundle"
	"github.com/mattermost/go-i18n/i18n/language"
	"github.com/mattermost/go-i18n/i18n/translation"
	"github.com/mattermost/mattermost/server/public/utils"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var htmlTestTranslationBundle *bundle.Bundle

func init() {
	htmlTestTranslationBundle = bundle.New()
	fooBold, _ := translation.NewTranslation(map[string]any{
		"id":          "foo.bold",
		"translation": "<p>[[{{ .Foo }}]]</p>",
	})
	htmlTestTranslationBundle.AddTranslation(&language.Language{Tag: "en"}, fooBold)
}

func TestInitTranslationsWithDirLoadDuration(t *testing.T) {
	i18nDir, found := utils.FindDir("server/i18n")
	require.True(t, found, "unable to find i18n dir")

	start := time.Now()
	err := initTranslationsWithDir(i18nDir)
	require.NoError(t, err)
	elapsed := time.Since(start)

	t.Logf("initTranslationsWithDir loaded %d locales in %s", len(locales), elapsed)
	require.Greater(t, len(locales), 0)
}

func TestTranslateAsHTML(t *testing.T) {
	assert.EqualValues(t, "<p><strong>&lt;i&gt;foo&lt;/i&gt;</strong></p>", TranslateAsHTML(TranslateFunc(htmlTestTranslationBundle.MustTfunc("en")), "foo.bold", map[string]any{
		"Foo": "<i>foo</i>",
	}))
}

func TestEscapeForHTML(t *testing.T) {
	stringForPointer := "<b>abc</b>"
	for name, tc := range map[string]struct {
		In       any
		Expected any
	}{
		"NoHTML": {
			In:       "abc",
			Expected: "abc",
		},
		"String": {
			In:       "<b>abc</b>",
			Expected: "&lt;b&gt;abc&lt;/b&gt;",
		},
		"StringPointer": {
			In:       &stringForPointer,
			Expected: "&lt;b&gt;abc&lt;/b&gt;",
		},
		"Map": {
			In: map[string]any{
				"abc": "abc",
				"123": "<b>123</b>",
			},
			Expected: map[string]any{
				"abc": "abc",
				"123": "&lt;b&gt;123&lt;/b&gt;",
			},
		},
		"Int": {
			In:       59,
			Expected: 59,
		},
		"Int64": {
			In:       int64(59),
			Expected: int64(59),
		},
		"Float64": {
			In:       3.14,
			Expected: 3.14,
		},
		"Unsupported": {
			In:       struct{ string }{"<b>abc</b>"},
			Expected: "",
		},
	} {
		t.Run(name, func(t *testing.T) {
			assert.Equal(t, tc.Expected, escapeForHTML(tc.In))
		})
	}
}

func TestInitTranslationsWithDir(t *testing.T) {
	i18nDir, found := utils.FindDir("server/i18n")
	require.True(t, found, "unable to find i18n dir")

	setup := func(t *testing.T, localesToCopy map[string]string) string {
		tempDir, err := os.MkdirTemp(os.TempDir(), "TestGetTranslationFuncForDir")
		require.NoError(t, err, "unable to create temporary directory")

		t.Cleanup(func() {
			err = os.RemoveAll(tempDir)
			require.NoError(t, err)
		})

		for locale, fromLocale := range localesToCopy {
			err = utils.CopyFile(
				filepath.Join(i18nDir, fmt.Sprintf("%s.json", fromLocale)),
				filepath.Join(tempDir, fmt.Sprintf("%s.json", locale)),
			)
			require.NoError(t, err)
		}

		return tempDir
	}

	t.Run("unsupported locale ignored", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr", "zz": "en"})

		err := initTranslationsWithDir(tempDir)
		require.NoError(t, err)

		_, found := locales["zz"]
		require.False(t, found, "should have ignored unsupported locale")
	})

	t.Run("malformed, unsupported locale ignored", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr", "zz": "en"})

		err := os.WriteFile(filepath.Join(tempDir, "xx.json"), []byte{'{'}, os.ModePerm)
		require.NoError(t, err)

		err = initTranslationsWithDir(tempDir)
		require.NoError(t, err)

		_, found := locales["xx"]
		require.False(t, found, "should have ignored malformed, unsupported locale")
	})

	t.Run("malformed, supported locale causes error", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"fr": "fr", "zz": "en"})

		err := os.WriteFile(filepath.Join(tempDir, "en.json"), []byte{'{'}, os.ModePerm)
		require.NoError(t, err)

		err = initTranslationsWithDir(tempDir)
		require.Error(t, err, "should have failed to load malformed, supported locale")
	})

	t.Run("known locales loaded ", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr"})

		err := initTranslationsWithDir(tempDir)
		require.NoError(t, err)

		_, found := locales["en"]
		require.True(t, found, "should have found en locale")
		_, found = locales["fr"]
		require.True(t, found, "should have found fr locale")
		_, found = locales["es"]
		require.False(t, found, "should not have found unloaded es locale")
	})

	t.Run("indexes locales but parses only english until first use", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr"})

		err := initTranslationsWithDir(tempDir)
		require.NoError(t, err)

		require.Equal(t, filepath.Join(tempDir, "en.json"), loadedLocales["en"])
		require.NotEqual(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"], "fr must not be parsed at init")

		tr := GetUserTranslations("fr")
		require.Equal(t, "Décembre", tr("December"))
		require.Equal(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"])
	})
}

func TestGetTranslationFuncForDir(t *testing.T) {
	i18nDir, found := utils.FindDir("server/i18n")
	require.True(t, found, "unable to find i18n dir")

	setup := func(t *testing.T, localesToCopy map[string]string) string {
		tempDir, err := os.MkdirTemp(os.TempDir(), "TestGetTranslationFuncForDir")
		require.NoError(t, err, "unable to create temporary directory")

		t.Cleanup(func() {
			err = os.RemoveAll(tempDir)
			require.NoError(t, err)
		})

		for locale, fromLocale := range localesToCopy {
			err = utils.CopyFile(
				filepath.Join(i18nDir, fmt.Sprintf("%s.json", fromLocale)),
				filepath.Join(tempDir, fmt.Sprintf("%s.json", locale)),
			)
			require.NoError(t, err)
		}

		return tempDir
	}

	t.Run("unknown locale falls back to english", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr", "zz": "en"})

		translationFunc, err := GetTranslationFuncForDir(tempDir)
		require.NoError(t, err)
		require.NotNil(t, translationFunc)

		require.Equal(t, "December", translationFunc("unknown")("December"))
	})

	t.Run("unsupported locale falls back to english", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr", "zz": "en"})

		translationFunc, err := GetTranslationFuncForDir(tempDir)
		require.NoError(t, err)
		require.NotNil(t, translationFunc)

		require.Equal(t, "December", translationFunc("zz")("December"))
	})

	t.Run("malformed, unsupported locale ignored and falls back to english", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr", "zz": "en"})

		err := os.WriteFile(filepath.Join(tempDir, "xx.json"), []byte{'{'}, os.ModePerm)
		require.NoError(t, err)

		translationFunc, err := GetTranslationFuncForDir(tempDir)
		require.NoError(t, err)
		require.NotNil(t, translationFunc)

		require.Equal(t, "December", translationFunc("xx")("December"))
	})

	t.Run("malformed, supported locale causes error", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"fr": "fr", "zz": "en"})

		err := os.WriteFile(filepath.Join(tempDir, "en.json"), []byte{'{'}, os.ModePerm)
		require.NoError(t, err)

		translationFunc, err := GetTranslationFuncForDir(tempDir)
		require.Error(t, err)
		require.Nil(t, translationFunc)
	})

	t.Run("known locale matches", func(t *testing.T) {
		tempDir := setup(t, map[string]string{"en": "en", "fr": "fr"})

		translationFunc, err := GetTranslationFuncForDir(tempDir)
		require.NoError(t, err)
		require.NotNil(t, translationFunc)

		require.Equal(t, "Décembre", translationFunc("fr")("December"))
		require.Equal(t, "December", translationFunc("en")("December"))
	})
}

func copyLocalesForTest(t *testing.T, localesToCopy map[string]string) string {
	t.Helper()
	i18nDir, found := utils.FindDir("server/i18n")
	require.True(t, found, "unable to find i18n dir")

	tempDir, err := os.MkdirTemp(os.TempDir(), "i18n-lazy-load")
	require.NoError(t, err)
	t.Cleanup(func() {
		require.NoError(t, os.RemoveAll(tempDir))
	})

	for locale, fromLocale := range localesToCopy {
		err = utils.CopyFile(
			filepath.Join(i18nDir, fmt.Sprintf("%s.json", fromLocale)),
			filepath.Join(tempDir, fmt.Sprintf("%s.json", locale)),
		)
		require.NoError(t, err)
	}
	return tempDir
}

func TestGetTranslationsAndLocaleFromRequest(t *testing.T) {
	tempDir := copyLocalesForTest(t, map[string]string{"en": "en", "fr": "fr", "pt-BR": "pt-BR"})
	require.NoError(t, initTranslationsWithDir(tempDir))
	defaultClientLocale = "en"

	req := func(accept string) *http.Request {
		r, err := http.NewRequest(http.MethodGet, "http://example.local", nil)
		require.NoError(t, err)
		if accept != "" {
			r.Header.Set("Accept-Language", accept)
		}
		return r
	}

	t.Run("full french tag loads on first request", func(t *testing.T) {
		require.NotEqual(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"])
		tr, locale := GetTranslationsAndLocaleFromRequest(req("fr"))
		require.Equal(t, "fr", locale)
		require.Equal(t, "Décembre", tr("December"))
		require.Equal(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"])
	})

	t.Run("pt-BR matches the full tag", func(t *testing.T) {
		tr, locale := GetTranslationsAndLocaleFromRequest(req("pt-BR,en;q=0.8"))
		require.Equal(t, "pt-BR", locale)
		require.NotEqual(t, "December", tr("December"))
		require.Equal(t, filepath.Join(tempDir, "pt-BR.json"), loadedLocales["pt-BR"])
	})

	t.Run("unknown header uses client default and keeps short header locale", func(t *testing.T) {
		defaultClientLocale = "fr"
		tr, locale := GetTranslationsAndLocaleFromRequest(req("es-MX"))
		require.Equal(t, "es", locale)
		require.Equal(t, "Décembre", tr("December"))
	})

	t.Run("unknown header and unknown client default returns english translations", func(t *testing.T) {
		defaultClientLocale = "zz"
		tr, locale := GetTranslationsAndLocaleFromRequest(req("zz"))
		require.Equal(t, "zz", locale)
		require.Equal(t, "December", tr("December"))
	})
}

func TestInitTranslationsLazyLocales(t *testing.T) {
	t.Run("missing configured server locale falls back to english", func(t *testing.T) {
		tempDir := copyLocalesForTest(t, map[string]string{"en": "en"})
		require.NoError(t, initTranslationsWithDir(tempDir))

		require.NoError(t, InitTranslations("fr", "en"))
		require.Equal(t, "December", T("December"))
		require.Equal(t, filepath.Join(tempDir, "en.json"), loadedLocales["en"])
		require.NotEqual(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"])
	})

	t.Run("configured server locale is parsed at init", func(t *testing.T) {
		tempDir := copyLocalesForTest(t, map[string]string{"en": "en", "fr": "fr"})
		require.NoError(t, initTranslationsWithDir(tempDir))

		require.NoError(t, InitTranslations("fr", "en"))
		require.Equal(t, "Décembre", T("December"))
		require.Equal(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"])
	})

	t.Run("distinct client locale is preloaded", func(t *testing.T) {
		tempDir := copyLocalesForTest(t, map[string]string{"en": "en", "fr": "fr"})
		require.NoError(t, initTranslationsWithDir(tempDir))

		require.NoError(t, InitTranslations("en", "fr"))
		require.Equal(t, filepath.Join(tempDir, "en.json"), loadedLocales["en"])
		require.Equal(t, filepath.Join(tempDir, "fr.json"), loadedLocales["fr"])
		require.Equal(t, "December", T("December"))
	})
}
