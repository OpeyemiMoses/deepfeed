import React, { useEffect, useRef, useState } from 'react'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { generateCandles } from '../data/mockData'

const TIMEFRAMES = [
  { label: '1m', seconds: 60, count: 120 },
  { label: '5m', seconds: 300, count: 100 },
  { label: '15m', seconds: 900, count: 96 },
  { label: '1H', seconds: 3600, count: 72 },
  { label: '4H', seconds: 14400, count: 60 },
  { label: '1D', seconds: 86400, count: 60 },
]

export default function TradingChart({ pair }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)
  const [tf, setTf] = useState(TIMEFRAMES[0])
  const [lastCandle, setLastCandle] = useState(null)
  const liveIntervalRef = useRef(null)
  const activePairIdRef = useRef(pair.id)

  // Build + destroy chart on mount
  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#64748B',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#1E2D4544' },
        horzLines: { color: '#1E2D4544' },
      },
      crosshair: {
        vertLine: { color: '#2563EB55', labelBackgroundColor: '#2563EB' },
        horzLine: { color: '#2563EB55', labelBackgroundColor: '#2563EB' },
      },
      rightPriceScale: {
        borderColor: '#1E2D45',
        textColor: '#64748B',
      },
      timeScale: {
        borderColor: '#1E2D45',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B98199',
      wickDownColor: '#EF444499',
    })

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    })

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    })
    ro.observe(chartContainerRef.current)

    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [])

  // Load candles when pair or timeframe changes
useEffect(() => {
  const thisPairId = pair.id
  const thisPairPrice = pair.price
  activePairIdRef.current = thisPairId

  if (!candleSeriesRef.current || !volumeSeriesRef.current) return
  if (liveIntervalRef.current) clearInterval(liveIntervalRef.current)

  // Defensive guard: if a stale effect somehow fires after a newer pair
  // has already taken over, refuse to render with the wrong price.
  if (activePairIdRef.current !== thisPairId) return

  const candles = generateCandles(thisPairPrice, tf.count)
    candleSeriesRef.current.setData(candles)
    volumeSeriesRef.current.setData(
      candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? '#10B98144' : '#EF444444',
      }))
    )
    chartRef.current?.timeScale().fitContent()
    console.log('[TradingChart] Setting lastCandle for', pair.id, ':', candles[candles.length - 1])
setLastCandle(candles[candles.length - 1])

    // Live tick simulation — update last candle every 2s
   liveIntervalRef.current = setInterval(() => {
  if (activePairIdRef.current !== thisPairId) return
  setLastCandle(prev => {
    if (!prev || !candleSeriesRef.current) return prev
        const tick = prev.close * (1 + (Math.random() - 0.5) * 0.002)
        const updated = {
          ...prev,
          close: +tick.toFixed(5),
          high: Math.max(prev.high, +tick.toFixed(5)),
          low: Math.min(prev.low, +tick.toFixed(5)),
        }
        candleSeriesRef.current.update(updated)
        return updated
      })
    }, 2000)

    return () => clearInterval(liveIntervalRef.current)
  }, [pair.id, tf.label])

  const priceUp = lastCandle ? lastCandle.close >= lastCandle.open : true

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chart toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Token icon + pair */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pair.iconUrl ? (
              <img
                src={pair.iconUrl}
                alt={pair.base}
                style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace',
              }}>{pair.base[0]}</div>
            )}
            <span className="mono" style={{ fontSize: 14, fontWeight: 700 }}>
              {pair.base}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{pair.quote}</span>
            </span>
          </div>

          {/* Live OHLC */}
          {lastCandle && (
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'O', val: lastCandle.open },
                { label: 'H', val: lastCandle.high },
                { label: 'L', val: lastCandle.low },
                { label: 'C', val: lastCandle.close },
              ].map(v => (
                <div key={v.label} style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: priceUp ? 'var(--green)' : 'var(--red)' }}>
                    {v.val.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe tabs */}
        <div style={{ display: 'flex', gap: 3 }}>
          {TIMEFRAMES.map(t => (
            <button
              key={t.label}
              onClick={() => setTf(t)}
              style={{
                padding: '4px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                background: tf.label === t.label ? 'var(--blue)' : 'var(--bg-3)',
                color: tf.label === t.label ? '#fff' : 'var(--text-muted)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} style={{ flex: 1, width: '100%' }} />
    </div>
  )
}
