package main

import (
	"fmt"
	"strings"
)

// modelPricing holds published xAI list prices in USD per million tokens.
type modelPricing struct {
	InputPerMTok       float64
	CachedInputPerMTok float64
	OutputPerMTok      float64
}

// Published list pricing from https://docs.x.ai/docs/models. Rates apply to
// prompts under the 200k-token tier, which is well above what a channel
// summary request produces.
var pricingByModel = map[string]modelPricing{
	"grok-4.6": {InputPerMTok: 2.00, CachedInputPerMTok: 0.50, OutputPerMTok: 6.00},
}

// pricingFor matches the exact model id first, then falls back to the longest
// known prefix so dated snapshots (e.g. "grok-4.6-20260801") still price.
func pricingFor(model string) (modelPricing, bool) {
	if p, ok := pricingByModel[model]; ok {
		return p, true
	}
	var bestPrefix string
	var best modelPricing
	for prefix, p := range pricingByModel {
		if strings.HasPrefix(model, prefix) && len(prefix) > len(bestPrefix) {
			bestPrefix = prefix
			best = p
		}
	}
	return best, bestPrefix != ""
}

// costUSD computes the dollar cost of a single API call from its usage object.
// Cached prompt tokens are billed at the cached-input rate; the remainder of
// the prompt at the full input rate.
func costUSD(usage chatUsage, pricing modelPricing) float64 {
	cached := usage.PromptTokensDetails.CachedTokens
	if cached > usage.PromptTokens {
		cached = usage.PromptTokens
	}
	fresh := usage.PromptTokens - cached

	return (float64(fresh)*pricing.InputPerMTok +
		float64(cached)*pricing.CachedInputPerMTok +
		float64(usage.CompletionTokens)*pricing.OutputPerMTok) / 1_000_000
}

// formatUSD renders small per-call amounts without rounding them to $0.00.
func formatUSD(amount float64) string {
	if amount >= 0.01 {
		return fmt.Sprintf("$%.4f", amount)
	}
	return fmt.Sprintf("$%.6f", amount)
}
