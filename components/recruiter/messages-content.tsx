'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Users, CheckCircle, XCircle, Clock, FileText, MessageSquare, Loader2, AlertCircle, User, Bot, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  cvAnalysis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: 'hire' | 'maybe' | 'reject';
  };
  appliedDate: string;
  status: 'pending' | 'contacted' | 'interviewed' | 'hired' | 'rejected';
  experience?: string;
  skills?: string;
  aiProvider?: string | null;
  summary?: string | null;
}

// Email templates with placeholders
const EMAIL_TEMPLATES = {
  positive: {
    subject: "Gratulacje! Zaproszenie na rozmowę - {{position}}",
    content: `Szanowny/a {{candidateName}},

Dziękujemy za aplikację na stanowisko {{position}}. Po analizie Twojego CV jesteśmy pod wrażeniem Twoich kwalifikacji!

🎯 **Twoje mocne strony:**
{{#strengths}}
• {{.}}
{{/strengths}}

Osiągnąłeś/aś {{score}} punktów na 100 możliwych w naszej analizie, co kwalifikuje Cię do kolejnego etapu.

**Następne kroki:**
Chcielibyśmy zaprosić Cię na rozmowę kwalifikacyjną. Skontaktujemy się z Tobą w ciągu 2-3 dni roboczych.

Gratulujemy i czekamy na spotkanie!

Pozdrawiamy,
Zespół Rekrutacji`
  },
  neutral: {
    subject: "Dodatkowe informacje - {{position}}",
    content: `Szanowny/a {{candidateName}},

Dziękujemy za zainteresowanie stanowiskiem {{position}}.

👍 **Pozytywne elementy Twojego profilu:**
{{#strengths}}
• {{.}}
{{/strengths}}

🔍 **Potrzebujemy wyjaśnienia:**
{{#weaknesses}}
• {{.}}
{{/weaknesses}}

Prosimy o przesłanie dodatkowych informacji lub dokumentów. Alternatywnie zapraszamy na krótką rozmowę telefoniczną.

Pozdrawiamy,
Zespół Rekrutacji`
  },
  negative: {
    subject: "Feedback dotyczący aplikacji - {{position}}",
    content: `Szanowny/a {{candidateName}},

Dziękujemy za aplikację na stanowisko {{position}}.

Po analizie musieliśmy podjąć decyzję o nieprzejściu do kolejnego etapu na to konkretne stanowisko.

{{#strengths}}
💡 **Pozytywne elementy:**
{{#strengths}}
• {{.}}
{{/strengths}}

{{/strengths}}
**Obszary do rozwoju:**
{{#weaknesses}}
• {{.}}
{{/weaknesses}}

Zachęcamy do śledzenia naszych przyszłych ofert. Życzymy powodzenia!

Pozdrawiamy,
Zespół Rekrutacji`
  }
};

const mockCandidates: Candidate[] = [];

export default function MessagesContent() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [aiTone, setAiTone] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState<any>(null);
  const { toast } = useToast();

  // Fetch candidates from database
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Fetch message history when history tab is accessed
  const fetchMessageHistory = async (page = 1) => {
    try {
      setHistoryLoading(true);
      const response = await fetch(`/api/recruiter/message-history?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch message history');
      }
      
      const data = await response.json();
      setMessageHistory(data.messages || []);
      setHistoryPagination(data.pagination);
      
      console.log(`✅ Loaded ${data.messages?.length || 0} message history entries`);
    } catch (error) {
      console.error('Error fetching message history:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać historii wiadomości",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recruiter/candidates-for-feedback');
      
      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }
      
      const data = await response.json();
      setCandidates(data.candidates || []);
      
      console.log(`✅ Loaded ${data.candidates?.length || 0} candidates from database`);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać listy kandydatów",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Template processing function
  const processTemplate = (template: string, candidate: Candidate): string => {
    let processed = template;
    
    // Replace placeholders
    processed = processed.replace(/\{\{candidateName\}\}/g, candidate.name);
    processed = processed.replace(/\{\{position\}\}/g, candidate.position);
    processed = processed.replace(/\{\{score\}\}/g, candidate.cvAnalysis.score.toString());
    
    // Handle strengths list
    const strengthsList = candidate.cvAnalysis.strengths
      .map(strength => `• ${strength}`)
      .join('\n');
    processed = processed.replace(/\{\{#strengths\}\}[\s\S]*?\{\{\/strengths\}\}/g, strengthsList);
    
    // Handle weaknesses list
    const weaknessesList = candidate.cvAnalysis.weaknesses
      .map(weakness => `• ${weakness}`)
      .join('\n');
    processed = processed.replace(/\{\{#weaknesses\}\}[\s\S]*?\{\{\/weaknesses\}\}/g, weaknessesList);
    
    return processed;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'contacted': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'interviewed': return <Users className="h-4 w-4 text-purple-500" />;
      case 'hired': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return <Badge className="bg-green-100 text-green-800">Polecam</Badge>;
      case 'maybe':
        return <Badge className="bg-yellow-100 text-yellow-800">Do rozważenia</Badge>;
      case 'reject':
        return <Badge className="bg-red-100 text-red-800">Odrzuć</Badge>;
      default:
        return <Badge variant="secondary">Nieznane</Badge>;
    }
  };

  // Unified AI generation helper using new /api/mail/generate endpoint
  const generateAIEmail = async (candidate: Candidate): Promise<string | null> => {
    try {
      const response = await fetch('/api/mail/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: {
            name: candidate.name,
            position: candidate.position,
            score: candidate.cvAnalysis.score,
            strengths: candidate.cvAnalysis.strengths,
            weaknesses: candidate.cvAnalysis.weaknesses,
            recommendation: candidate.cvAnalysis.recommendation
          },
          tone: aiTone,
          recruiterInstructions: aiInstructions || undefined,
          language: 'pl'
        })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.content || null;
    } catch (e) {
      console.error('AI generate error', e);
      return null;
    }
  };

  const generateFallbackFeedback = (candidate: Candidate) => {
    const { cvAnalysis } = candidate;
    
    if (cvAnalysis.recommendation === 'hire') {
      return `Dziękujemy za aplikację na stanowisko ${candidate.position}. 

Po analizie Twojego CV jesteśmy pod wrażeniem Twoich kwalifikacji, szczególnie:
${cvAnalysis.strengths.map(s => `• ${s}`).join('\n')}

Chcielibyśmy zaprosić Cię na rozmowę kwalifikacyjną. Skontaktujemy się z Tobą w ciągu najbliższych dni w celu ustalenia terminu.

Pozdrawiamy,
Zespół Rekrutacji`;
    } else if (cvAnalysis.recommendation === 'maybe') {
      return `Dziękujemy za zainteresowanie stanowiskiem ${candidate.position}.

Twoje CV zawiera obiecujące elementy:
${cvAnalysis.strengths.map(s => `• ${s}`).join('\n')}

Jednocześnie chcielibyśmy zwrócić uwagę na obszary do rozwoju:
${cvAnalysis.weaknesses.map(w => `• ${w}`).join('\n')}

Rozważymy Twoją kandydaturę i skontaktujemy się z Tobą, jeśli zdecydujemy o dalszych krokach.

Pozdrawiamy,
Zespół Rekrutacji`;
    } else {
      return `Dziękujemy za aplikację na stanowisko ${candidate.position}.

Po dokładnej analizie Twojego CV musieliśmy podjąć trudną decyzję o nieprzejściu do kolejnego etapu rekrutacji. Twój profil nie odpowiada w pełni aktualnym wymaganiom stanowiska.

Zachęcamy do śledzenia naszych przyszłych ofert pracy, które mogą lepiej odpowiadać Twoim kwalifikacjom.

Dziękujemy za zainteresowanie naszą firmą.

Pozdrawiamy,
Zespół Rekrutacji`;
    }
  };

  const handleSendEmail = async () => {
    if (!selectedCandidate) return;

    setIsLoading(true);
    try {
      let finalMessage = customMessage;
      let finalSubject = customSubject;
      
      // Use template if selected
      if (emailTemplate && emailTemplate !== 'custom' && emailTemplate !== 'ai-feedback') {
        const template = EMAIL_TEMPLATES[emailTemplate as keyof typeof EMAIL_TEMPLATES];
        if (template) {
          finalSubject = processTemplate(template.subject, selectedCandidate);
          finalMessage = processTemplate(template.content, selectedCandidate);
        }
      }
      
      // If AI mode chosen and we don't yet have generated text, auto-generate now
      if (emailTemplate === 'ai-feedback') {
        if (!finalMessage.trim()) {
          const aiText = await generateAIEmail(selectedCandidate);
          if (aiText) {
            finalMessage = aiText;
          } else {
            // fallback
            finalMessage = generateFallbackFeedback(selectedCandidate);
            toast({
              title: 'AI niedostępne',
              description: 'Użyto fallback zamiast generowanego tekstu.',
            });
          }
        }
      }

      const response = await fetch('/api/mail/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedCandidate.email,
          candidateName: selectedCandidate.name,
          position: selectedCandidate.position,
          subject: finalSubject || `Feedback dot. aplikacji - ${selectedCandidate.position}`,
          message: finalMessage,
          template: emailTemplate,
          candidateId: selectedCandidate.id
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd wysyłania maila');
      }

      const result = await response.json();

      toast({
        title: "Mail wysłany!",
        description: `Feedback został wysłany do ${selectedCandidate.name}. Kandydat został oznaczony jako skontaktowany.`,
      });

      // Refresh candidates list to show updated status
      fetchCandidates();

      // Reset form
      setSelectedCandidate(null);
      setCustomMessage('');
      setCustomSubject('');
      setEmailTemplate('');

    } catch (error) {
      console.error('Send email error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać maila. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wiadomości</h1>
          <p className="text-muted-foreground">
            Zarządzaj komunikacją z kandydatami i wysyłaj spersonalizowany feedback
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            {candidates.filter(c => c.status === 'pending').length} oczekujących
          </span>
        </div>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Kandydaci</TabsTrigger>
          <TabsTrigger value="templates">Szablony</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista kandydatów */}
            <Card>
              <CardHeader>
                <CardTitle>Kandydaci oczekujący feedback</CardTitle>
                <CardDescription>
                  Wybierz kandydata, aby wysłać spersonalizowaną wiadomość
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Ładowanie kandydatów...</span>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                    <p>Brak kandydatów oczekujących na feedback.</p>
                    <p className="text-sm mt-2">Kandydaci pojawią się tutaj po złożeniu aplikacji.</p>
                  </div>
                ) : (
                  candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCandidate?.id === candidate.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{candidate.name}</h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(candidate.status)}
                          {getRecommendationBadge(candidate.cvAnalysis.recommendation)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {candidate.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {candidate.email} • Aplikacja: {candidate.appliedDate}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3" />
                          <span>Ocena CV: {candidate.cvAnalysis.score}/100</span>
                          {candidate.aiProvider && (
                            <Badge variant="outline" className="text-xs">
                              {candidate.aiProvider}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Formularz wysyłania maila */}
            <Card>
              <CardHeader>
                <CardTitle>Wyślij feedback</CardTitle>
                <CardDescription>
                  Spersonalizowana wiadomość dla kandydata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedCandidate ? (
                  <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertTitle>Wybierz kandydata</AlertTitle>
                    <AlertDescription>
                      Najpierw wybierz kandydata z listy po lewej stronie.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Kandydat</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{selectedCandidate.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidate.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidate.position}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template">Szablon wiadomości</Label>
                      <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz szablon lub napisz własny" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai-feedback">AI - Automatyczny feedback</SelectItem>
                          <SelectItem value="positive">Pozytywny - Zaproszenie na rozmowę</SelectItem>
                          <SelectItem value="neutral">Neutralny - Prośba o więcej info</SelectItem>
                          <SelectItem value="negative">Negatywny - Odrzucenie</SelectItem>
                          <SelectItem value="custom">Napisz własny</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Temat wiadomości</Label>
                      <Input
                        id="subject"
                        value={customSubject}
                        onChange={(e) => setCustomSubject(e.target.value)}
                        placeholder={`Feedback dot. aplikacji - ${selectedCandidate.position}`}
                      />
                    </div>

                    {(emailTemplate === 'positive' || emailTemplate === 'neutral' || emailTemplate === 'negative') && selectedCandidate && (
                      <div className="space-y-2">
                        <Label>Podgląd szablonu</Label>
                        <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                          <p className="font-medium mb-2">
                            Temat: {processTemplate(EMAIL_TEMPLATES[emailTemplate as keyof typeof EMAIL_TEMPLATES].subject, selectedCandidate)}
                          </p>
                          <div className="whitespace-pre-line text-xs text-muted-foreground max-h-32 overflow-y-auto">
                            {processTemplate(EMAIL_TEMPLATES[emailTemplate as keyof typeof EMAIL_TEMPLATES].content, selectedCandidate)}
                          </div>
                        </div>
                      </div>
                    )}

                    {emailTemplate === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="message">Treść wiadomości</Label>
                        <Textarea
                          id="message"
                          rows={8}
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Napisz spersonalizowaną wiadomość..."
                        />
                      </div>
                    )}

                    {emailTemplate === 'ai-feedback' && (
                      <div className="space-y-4">
                        <Alert>
                          <FileText className="h-4 w-4" />
                          <AlertTitle>AI Feedback</AlertTitle>
                          <AlertDescription>
                            Wiadomość generowana przez model (llama). Ocena: {selectedCandidate.cvAnalysis.score}/100 — {selectedCandidate.cvAnalysis.recommendation === 'hire' ? 'Polecam' : selectedCandidate.cvAnalysis.recommendation === 'maybe' ? 'Do rozważenia' : 'Odrzuć'}
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2 md:col-span-1">
                            <Label>Ton wiadomości</Label>
                            <Select value={aiTone} onValueChange={(v: any) => setAiTone(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="positive">Pozytywny</SelectItem>
                                <SelectItem value="neutral">Neutralny</SelectItem>
                                <SelectItem value="negative">Negatywny</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Dodatkowe instrukcje dla AI (opcjonalnie)</Label>
                            <Textarea
                              rows={3}
                              placeholder="Np. skróć do 4 akapitów, dodaj zaproszenie na rozmowę online, zachowaj empatyczny ton..."
                              value={aiInstructions}
                              onChange={(e) => setAiInstructions(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={aiGenerating}
                            onClick={async () => {
                              if (!selectedCandidate) return;
                              setAiGenerating(true);
                              try {
                                const response = await fetch('/api/mail/generate', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    candidate: {
                                      name: selectedCandidate.name,
                                      position: selectedCandidate.position,
                                      score: selectedCandidate.cvAnalysis.score,
                                      strengths: selectedCandidate.cvAnalysis.strengths,
                                      weaknesses: selectedCandidate.cvAnalysis.weaknesses,
                                      recommendation: selectedCandidate.cvAnalysis.recommendation
                                    },
                                    tone: aiTone,
                                    recruiterInstructions: aiInstructions || undefined,
                                    language: 'pl'
                                  })
                                });
                                if (!response.ok) throw new Error('Błąd generowania');
                                const data = await response.json();
                                if (data.content) {
                                  setCustomMessage(data.content);
                                }
                              } catch (err) {
                                toast({
                                  title: 'Błąd AI',
                                  description: 'Nie udało się wygenerować treści przy użyciu modelu. Użyj własnej treści.',
                                  variant: 'destructive'
                                });
                              } finally {
                                setAiGenerating(false);
                              }
                            }}
                          >
                            {aiGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                            {aiGenerating ? 'Generowanie...' : 'Wygeneruj treść'}
                          </Button>  
                        </div>
                        <div className="space-y-2">
                          <Label>Wygenerowana treść (możesz edytować przed wysłaniem)</Label>
                          <Textarea
                            rows={8}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Kliknij 'Wygeneruj treść' aby utworzyć wiadomość..."
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleSendEmail}
                      disabled={isLoading || !emailTemplate || (
                        (emailTemplate === 'custom' && !customMessage.trim()) ||
                        (emailTemplate === 'ai-feedback' && !customMessage.trim())
                      )}
                      className="w-full"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isLoading ? 'Wysyłanie...' : 'Wyślij feedback'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Szablony wiadomości</CardTitle>
              <CardDescription>
                Predefiniowane szablony z automatycznym wypełnianiem danych kandydata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
                  <div key={key} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      {key === 'positive' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {key === 'neutral' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                      {key === 'negative' && <XCircle className="h-4 w-4 text-red-500" />}
                      {key === 'positive' && 'Pozytywny feedback'}
                      {key === 'neutral' && 'Neutralny feedback'}
                      {key === 'negative' && 'Negatywny feedback'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {key === 'positive' && 'Dla kandydatów z wysoką oceną - zaproszenie na rozmowę'}
                      {key === 'neutral' && 'Dla kandydatów wymagających dodatkowych informacji'}
                      {key === 'negative' && 'Grzeczne odrzucenie z konstruktywnym feedbackiem'}
                    </p>
                    <div className="text-xs bg-gray-50 p-3 rounded">
                      <p className="font-medium mb-1">Temat:</p>
                      <p className="mb-2 text-muted-foreground">{template.subject}</p>
                      <p className="font-medium mb-1">Treść (fragment):</p>
                      <div className="text-muted-foreground whitespace-pre-line max-h-24 overflow-hidden">
                        {template.content.substring(0, 200)}...
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-600">
                      <strong>Placeholders:</strong> {`{{candidateName}}, {{position}}, {{score}}, {{strengths}}, {{weaknesses}}`}
                    </div>
                  </div>
                ))}
                
                <div className="p-4 border rounded-lg border-dashed">
                  <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    AI Feedback
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatycznie generowany na podstawie analizy CV kandydata
                  </p>
                  <div className="text-xs bg-blue-50 p-3 rounded">
                    <p>• Inteligentna analiza mocnych i słabych stron</p>
                    <p>• Dopasowany ton w zależności od oceny</p>
                    <p>• Spersonalizowane rekomendacje</p>
                    <p>• Wykorzystuje AI do generowania treści</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historia wiadomości</CardTitle>
              <CardDescription>
                Przegląd wszystkich wysłanych wiadomości z kandydatami
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!messageHistory.length && !historyLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Button 
                    onClick={() => fetchMessageHistory(1)}
                    variant="outline"
                    className="mb-4"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Pokaż historię wiadomości
                  </Button>
                  <div className="text-center text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4" />
                    <p>Kliknij przycisk powyżej, aby załadować historię wiadomości.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Ładowanie historii...</span>
                    </div>
                  ) : messageHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4" />
                      <p>Brak wysłanych wiadomości.</p>
                      <p className="text-sm mt-2">Historia pojawi się po wysłaniu pierwszej wiadomości.</p>
                    </div>
                  ) : (
                    <>
                      {messageHistory.map((message) => (
                        <div key={message.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{message.subject}</h4>
                                <Badge 
                                  variant={
                                    message.status === 'SENT' ? 'default' :
                                    message.status === 'DELIVERED' ? 'secondary' :
                                    message.status === 'FAILED' ? 'destructive' :
                                    'outline'
                                  }
                                >
                                  {message.status === 'SENT' ? 'Wysłane' :
                                   message.status === 'DELIVERED' ? 'Dostarczone' :
                                   message.status === 'FAILED' ? 'Błąd' :
                                   message.status}
                                </Badge>
                                {message.template && (
                                  <Badge variant="outline">
                                    {message.template === 'positive' ? 'Pozytywny' :
                                     message.template === 'neutral' ? 'Neutralny' :
                                     message.template === 'negative' ? 'Negatywny' :
                                     message.template === 'ai-feedback' ? 'AI Feedback' :
                                     'Custom'}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{message.candidate.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{message.candidate.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(message.sentAt).toLocaleString('pl-PL')}</span>
                                </div>
                              </div>
                              <div className="text-sm">
                                <strong>Stanowisko:</strong> {message.candidate.position}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.mailProvider === 'mailchimp' ? 'Mailchimp' : 'Email'}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded text-sm">
                            <div className="max-h-32 overflow-y-auto">
                              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                            </div>
                          </div>
                          
                          {message.errorMessage && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Błąd:</strong> {message.errorMessage}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      ))}
                      
                      {historyPagination && historyPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                          <p className="text-sm text-muted-foreground">
                            Strona {historyPagination.currentPage} z {historyPagination.totalPages} 
                            ({historyPagination.totalCount} wiadomości)
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!historyPagination.hasPreviousPage || historyLoading}
                              onClick={() => {
                                const newPage = historyPagination.currentPage - 1;
                                setHistoryPage(newPage);
                                fetchMessageHistory(newPage);
                              }}
                            >
                              Poprzednia
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!historyPagination.hasNextPage || historyLoading}
                              onClick={() => {
                                const newPage = historyPagination.currentPage + 1;
                                setHistoryPage(newPage);
                                fetchMessageHistory(newPage);
                              }}
                            >
                              Następna
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}