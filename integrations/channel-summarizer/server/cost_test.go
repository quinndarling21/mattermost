package main

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCostUSD(t *testing.T) {
	pricing, ok := pricingFor("grok-4.6")
	require.True(t, ok)

	t.Run("input and output tokens at list price", func(t *testing.T) {
		usage := chatUsage{PromptTokens: 1_000_000, CompletionTokens: 1_000_000}
		// $2.00/1M input + $6.00/1M output
		assert.InDelta(t, 8.00, costUSD(usage, pricing), 1e-9)
	})

	t.Run("cached prompt tokens billed at cached rate", func(t *testing.T) {
		usage := chatUsage{
			PromptTokens:        1_000_000,
			CompletionTokens:    0,
			PromptTokensDetails: promptTokensDetails{CachedTokens: 400_000},
		}
		// 600k fresh * $2.00/1M + 400k cached * $0.50/1M
		assert.InDelta(t, 1.40, costUSD(usage, pricing), 1e-9)
	})

	t.Run("typical summary call", func(t *testing.T) {
		usage := chatUsage{PromptTokens: 1200, CompletionTokens: 300}
		// 1200 * 2.00/1M + 300 * 6.00/1M = 0.0024 + 0.0018
		assert.InDelta(t, 0.0042, costUSD(usage, pricing), 1e-9)
	})

	t.Run("cached tokens never exceed prompt tokens", func(t *testing.T) {
		usage := chatUsage{
			PromptTokens:        100,
			PromptTokensDetails: promptTokensDetails{CachedTokens: 500},
		}
		// All 100 tokens billed as cached.
		assert.InDelta(t, 100*0.50/1_000_000, costUSD(usage, pricing), 1e-9)
	})
}

func TestPricingFor(t *testing.T) {
	t.Run("exact model id", func(t *testing.T) {
		_, ok := pricingFor("grok-4.6")
		assert.True(t, ok)
	})

	t.Run("dated snapshot falls back to prefix", func(t *testing.T) {
		pricing, ok := pricingFor("grok-4.6-20260801")
		require.True(t, ok)
		assert.Equal(t, 2.00, pricing.InputPerMTok)
	})

	t.Run("unknown model", func(t *testing.T) {
		_, ok := pricingFor("some-other-model")
		assert.False(t, ok)
	})
}

func TestFormatUSD(t *testing.T) {
	assert.Equal(t, "$0.004200", formatUSD(0.0042))
	assert.Equal(t, "$0.0125", formatUSD(0.0125))
	assert.Equal(t, "$8.0000", formatUSD(8.0))
}

func TestFormatTokens(t *testing.T) {
	assert.Equal(t, "950", formatTokens(950))
	assert.Equal(t, "1,234", formatTokens(1234))
	assert.Equal(t, "1,234,567", formatTokens(1234567))
}
