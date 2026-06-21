import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap } from 'lucide-react'
import { createConditionalOrder } from '../lib/conditionalOrders'

const LIVE_PAIR_IDS = ['SUI_DBUSDC', 'DEEP_DBUSDC']

const SYSTEM_PROMPT = (pair, price, hasAutomation) => `You are DeepFeed AI, a friendly trading assistant for the DeepBook DEX on Sui.
Current context: User is viewing ${pair.base}/${pair.quote} at $${price}.
Keep responses SHORT (2-4 sentences max). Use plain English — no jargon without explanation.
Be helpful, honest, and direct. If asked about trading decisions, explain the risk.
You can reference the current price and pair. Do not make up order book data.

${hasAutomation
  ? `You CAN place real conditional orders using the create_conditional_order tool when the user clearly asks for one (e.g. "buy 2 SUI when it drops below $3"). Always confirm the side, quantity, trigger price, and pair back to the user in your response after calling the tool. Only SUI/DBUSDC and DEEP/DBUSDC pairs support real conditional orders — for any other pair, explain that execution is simulated only.`
  : `The user has not set up automated trading yet, so you CANNOT place real orders. If they ask you to place an order, tell them to set up automated trading first using the panel on the right.`
}`

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'create_conditional_order',
      description: 'Creates a real conditional order on DeepBook testnet that executes automatically when a price condition is met.',
      parameters: {
        type: 'object',
        properties: {
          side: { type: 'string', enum: ['buy', 'sell'], description: 'Whether to buy or sell the base asset' },
          triggerType: { type: 'string', enum: ['price_below', 'price_above'], description: 'Whether the order triggers when price drops below or rises above the trigger price' },
          triggerPrice: { type: 'number', description: 'The price at which the order should trigger' },
          quantity: { type: 'number', description: 'The amount of the base asset (e.g. SUI) to buy or sell' },
        },
        required: ['side', 'triggerType', 'triggerPrice', 'quantity'],
      },
    },
  },
]

const SUGGESTIONS = [
  'Is now a good time to buy SUI?',
  'What\'s the difference between limit and market orders?',
  'Explain bid-ask spread simply',
  'How does DeepBook work?',
]

export default function AIAssistant({ pair, account, automationSetup, onOrderCreated }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey! I'm your DeepFeed AI assistant. I can explain market conditions, help you understand orders, or even place a conditional order for you. What would you like to know about ${pair.base}/${pair.quote}?`,
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function callGroq(conversationMessages) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: conversationMessages,
        tools: automationSetup ? TOOLS : undefined,
      }),
    })
    return res.json()
  }

  async function handleToolCall(toolCall, conversationMessages) {
    const args = JSON.parse(toolCall.function.arguments)
    const isLivePair = LIVE_PAIR_IDS.includes(pair.id)

    let toolResultContent
    let createdOrder = null

    if (!automationSetup) {
      toolResultContent = JSON.stringify({ error: 'Automated trading is not set up yet.' })
    } else if (!isLivePair) {
      toolResultContent = JSON.stringify({ error: `${pair.base}/${pair.quote} does not support real conditional orders. Only SUI/DBUSDC and DEEP/DBUSDC do.` })
    } else if (!account) {
      toolResultContent = JSON.stringify({ error: 'No wallet connected.' })
    } else {
      try {
        const order = await createConditionalOrder({
          userAddress: account.address,
          balanceManagerAddress: automationSetup.balanceManagerAddress,
          tradeCapId: automationSetup.tradeCapId,
          pairId: pair.id,
          side: args.side,
          triggerType: args.triggerType,
          triggerPrice: args.triggerPrice,
          quantity: args.quantity,
        })
        createdOrder = order
        toolResultContent = JSON.stringify({ success: true, order })
      } catch (err) {
        toolResultContent = JSON.stringify({ error: err.message })
      }
    }

    const followUpMessages = [
      ...conversationMessages,
      { role: 'assistant', content: null, tool_calls: [toolCall] },
      { role: 'tool', tool_call_id: toolCall.id, content: toolResultContent },
    ]

    const followUpData = await callGroq(followUpMessages)
    const followUpReply = followUpData.choices?.[0]?.message?.content || 'Done.'

    setMessages(prev => [...prev, { role: 'assistant', content: followUpReply }])

    if (createdOrder) {
      onOrderCreated?.(createdOrder)
    }
  }

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || thinking) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setThinking(true)

    try {
      const conversationMessages = [
        { role: 'system', content: SYSTEM_PROMPT(pair, pair.price, !!automationSetup) },
        ...updated.map(m => ({ role: m.role, content: m.content })),
      ]

      const data = await callGroq(conversationMessages)
      const choice = data.choices?.[0]

      if (choice?.message?.tool_calls?.length) {
        await handleToolCall(choice.message.tool_calls[0], conversationMessages)
      } else {
        const reply = choice?.message?.content || 'Sorry, I had trouble responding. Try again.'
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      }
    } catch (err) {
      console.error('[AIAssistant] Error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setThinking(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={15} color="#fff" />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>DeepFeed AI</div>
          <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
            {automationSetup ? 'online · can place orders' : 'online'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 4 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-3)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {m.role === 'user' ? <User size={12} color="#fff" /> : <Bot size={12} color="var(--blue-bright)" />}
            </div>
            <div style={{
              maxWidth: '82%',
              background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-3)',
              border: `1px solid ${m.role === 'user' ? 'transparent' : 'var(--border)'}`,
              borderRadius: m.role === 'user' ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
              padding: '10px 13px',
            }}>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: m.role === 'user' ? '#fff' : 'var(--text-dim)' }}>
                {m.content}
              </p>
            </div>
          </div>
        ))}

        {thinking && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={12} color="var(--blue-bright)" />
            </div>
            <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: '2px 12px 12px 12px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
              <div className="thinking-dot" />
              <div className="thinking-dot" />
              <div className="thinking-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              fontSize: 11, padding: '5px 10px', borderRadius: 999,
              background: 'var(--bg-3)', border: '1px solid var(--border)',
              color: 'var(--text-dim)', cursor: 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-dim)' }}
            >{s}</button>
          ))}
          {automationSetup && (
            <button onClick={() => send(`Buy 1.5 ${pair.base} when it drops below $${(pair.price * 0.97).toFixed(4)}`)} style={{
              fontSize: 11, padding: '5px 10px', borderRadius: 999,
              background: '#2563EB18', border: '1px solid var(--blue)',
              color: 'var(--blue-bright)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Zap size={10} /> Try: place an order
            </button>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything, or tell me to place an order..."
          style={{ flex: 1, fontSize: 13, padding: '10px 12px' }}
          disabled={thinking}
        />
        <button
          onClick={() => send()}
          disabled={thinking || !input.trim()}
          style={{
            width: 38, height: 38, borderRadius: 8,
            background: input.trim() ? 'var(--blue)' : 'var(--bg-3)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <Send size={14} color={input.trim() ? '#fff' : 'var(--text-muted)'} />
        </button>
      </div>
    </div>
  )
}