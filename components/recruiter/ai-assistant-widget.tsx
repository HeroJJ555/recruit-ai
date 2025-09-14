"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, User, Bot } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  pending?: boolean
  error?: boolean
}

export function AIAssistantWidget() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([{
    id: "init",
    role: "assistant",
    content: "Cześć! Jestem Twoim asystentem AI. Zadaj pytanie o proces rekrutacji, opis stanowiska albo analizę kandydatów.",
    timestamp: new Date(),
  }])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const shouldStickToBottomRef = useRef(true)
  const inputRef = useRef<HTMLInputElement | null>(null)

 
  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return
    const el = scrollAreaRef.current
    const bottomThreshold = 64
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldStickToBottomRef.current = distanceFromBottom < bottomThreshold
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!endRef.current) return
    if (!shouldStickToBottomRef.current) return
    endRef.current.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom(messages.length <= 2 ? 'auto' : 'smooth')
  }, [messages, scrollToBottom])

  async function handleSendMessage() {
    if (!inputValue.trim() || isLoading) return
    
    const userContent = inputValue.trim()
    
    // Przekieruj do zakładki Asystent AI z pytaniem w URL
    const encodedQuestion = encodeURIComponent(userContent)
    router.push(`/recruiter/ai-assistant?q=${encodedQuestion}`)
  }



  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>Asystent AI dla HR</span>
        </CardTitle>
        <CardDescription>Specjalistyczne wsparcie w procesach rekrutacyjnych i zarządzaniu talentami</CardDescription>
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
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                        __html: message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                          .replace(/• /g, '• ')
                          .replace(/\n/g, '<br/>')
                      }} />
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
              placeholder="Np. 'Jak ocenić kandydata na stanowisko developera?' lub 'Przygotuj pytania do rozmowy kwalifikacyjnej'"
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