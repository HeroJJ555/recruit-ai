"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, User, Bot } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  pending?: boolean
  error?: boolean
}

export function AIAssistantWidget() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "init",
    role: "assistant",
    content: "Cześć! Jestem Twoim asystentem AI (demo). Zadaj pytanie o proces rekrutacji, opis stanowiska albo analizę kandydatów.",
    timestamp: new Date(),
  }])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Track manual scrolling: if user scrolls up beyond threshold, disable auto-stick until they reach bottom again
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return
    const el = scrollAreaRef.current
    const bottomThreshold = 64 // px
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldStickToBottomRef.current = distanceFromBottom < bottomThreshold
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!endRef.current) return
    if (!shouldStickToBottomRef.current) return // user intentionally scrolled up
    endRef.current.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom(messages.length <= 2 ? 'auto' : 'smooth')
  }, [messages, scrollToBottom])

  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading) return
    setErrorMsg(null)
    const userContent = inputValue.trim()
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: userContent, timestamp: new Date() }
    const pendingAssistant: Message = { id: userMessage.id + "_pending", role: "assistant", content: "…", timestamp: new Date(), pending: true }
    setMessages(prev => [...prev, userMessage, pendingAssistant])
    setInputValue("")
    setIsLoading(true)

    const payloadMessages = messages
      .concat([{ id: "temp" + Date.now(), role: "user", content: userContent, timestamp: new Date() }])
      .map(m => ({ role: m.role, content: m.content }))
    const payload = {
      messages: payloadMessages,
    }
    try {
      console.log('Sending chat request:', payload)
      const res = await fetch("/api/ai/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      console.log('Chat response status:', res.status)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        console.log('Error response:', j)
        throw new Error(j.error || `Błąd API (${res.status})`)
      }
      const data = await res.json()
      console.log('Chat response data:', data)
      setMessages(prev => prev.map(m => m.id === pendingAssistant.id ? { ...m, content: data.answer || "(pusta odpowiedź)", pending: false } : m))
    } catch (e: any) {
      setErrorMsg(e.message)
      setMessages(prev => prev.map(m => m.id === pendingAssistant.id ? { ...m, content: "Błąd: " + e.message, error: true, pending: false } : m))
    } finally {
      setIsLoading(false)
      // Focus input field immediately after sending
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>Asystent AI</span>
        </CardTitle>
        <CardDescription>Zadaj pytanie lub poproś o pomoc w procesie rekrutacyjnym</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4 min-h-0" ref={scrollAreaRef as any} onScroll={handleScroll}>
          <div className="space-y-4" >
            {messages.map(message => {
              const isUser = message.role === "user"
              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className={`p-2 rounded-full ${isUser ? "bg-primary" : message.error ? "bg-destructive/20" : "bg-secondary"}`}>
                      {isUser ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className={`h-4 w-4 ${message.error ? "text-destructive" : "text-secondary-foreground"}`} />}
                    </div>
                    <div className={`p-3 rounded-lg text-sm leading-relaxed ${isUser ? "bg-primary text-primary-foreground" : message.error ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      <p>{message.content}</p>
                      {message.pending && !message.error && (
                        <div className="mt-2 flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>
        </ScrollArea>
        <div className="flex-shrink-0 pt-4">
          {errorMsg && <p className="text-xs text-destructive mb-2">{errorMsg}</p>}
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Zadaj pytanie asystentowi"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
