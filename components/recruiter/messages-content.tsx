"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, MessageSquare, Loader2, CheckCircle, XCircle, AlertCircle, Bot, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'pending' | 'contacted' | 'interviewed' | 'hired' | 'rejected';
  appliedDate?: string;
  cvAnalysis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendation: 'hire' | 'maybe' | 'reject';
  };
}

type BuiltInTemplate = 'positive' | 'neutral' | 'negative';
type TemplateKey = BuiltInTemplate | 'custom' | 'ai-feedback' | '';

const EMAIL_TEMPLATES: Record<BuiltInTemplate, { subject: string; content: string }> = {
  positive: {
    subject: 'Gratulacje – kolejny etap rekrutacji ({{position}})',
    content: `Cześć {{candidateName}},\n\nDziękujemy za Twoją aplikację na stanowisko {{position}}. Po analizie CV otrzymałeś wynik {{score}}/100. Jesteśmy pod wrażeniem Twoich mocnych stron:\n{{#strengths}}• {{.}}\n{{/strengths}}\nChcielibyśmy zaprosić Cię do kolejnego etapu. Skontaktujemy się wkrótce z propozycją terminu.\n\nPozdrawiamy\nZespół Rekrutacji`
  },
  neutral: {
    subject: 'Aktualizacja procesu rekrutacji – {{position}}',
    content: `Cześć {{candidateName}},\n\nDziękujemy za przesłanie aplikacji na stanowisko {{position}}. Twój wynik to {{score}}/100. Doceniamy szczególnie:\n{{#strengths}}• {{.}}\n{{/strengths}}\nObecnie analizujemy pozostałe zgłoszenia i wrócimy do Ciebie z informacją o dalszych krokach.\n\nPozdrawiamy\nZespół Rekrutacji`
  },
  negative: {
    subject: 'Dziękujemy za aplikację – {{position}}',
    content: `Cześć {{candidateName}},\n\nDziękujemy za zainteresowanie stanowiskiem {{position}}. Po analizie CV (wynik {{score}}/100) musimy tym razem zakończyć proces.\nMocne strony:\n{{#strengths}}• {{.}}\n{{/strengths}}\nObszary do wzmocnienia:\n{{#weaknesses}}• {{.}}\n{{/weaknesses}}\nZachęcamy do śledzenia kolejnych ofert. Powodzenia!\n\nPozdrawiamy\nZespół Rekrutacji`
  }
};

interface StoredCustomTemplates {
  [key: string]: { subject: string; content: string };
}

// Helper to apply simple mustache-like placeholders & sections
function processTemplate(raw: string, candidate: Candidate): string {
  let out = raw;
  out = out.replace(/{{candidateName}}/g, candidate.name)
           .replace(/{{position}}/g, candidate.position)
           .replace(/{{score}}/g, String(candidate.cvAnalysis.score));
  // section strengths
  out = out.replace(/{{#strengths}}([\s\S]*?){{\/strengths}}/g, (_m, inner) => candidate.cvAnalysis.strengths.map(s => inner.replace(/{{\.}}/g, s)).join('\n'));
  out = out.replace(/{{#weaknesses}}([\s\S]*?){{\/weaknesses}}/g, (_m, inner) => candidate.cvAnalysis.weaknesses.map(s => inner.replace(/{{\.}}/g, s)).join('\n'));
  return out;
}

export default function MessagesContent() {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [templateKey, setTemplateKey] = useState<TemplateKey>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<StoredCustomTemplates>({});
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [aiTone, setAiTone] = useState<'pozytywny' | 'neutralny' | 'negatywny'>('neutralny');
  const [aiInstructions, setAiInstructions] = useState('');

  // Fetch candidates
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/recruiter/candidates-for-feedback');
        if (!res.ok) throw new Error('Błąd pobierania');
        const data = await res.json();
        setCandidates(data.candidates || data || []); // adapt to current route shape
      } catch (e) {
        console.error(e);
        toast({ title: 'Błąd', description: 'Nie udało się pobrać kandydatów', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  // Load custom templates
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('custom-email-templates');
      if (raw) setCustomTemplates(JSON.parse(raw));
    } catch {}
  }, []);

  const persistCustomTemplates = (next: StoredCustomTemplates) => {
    setCustomTemplates(next);
    try { window.localStorage.setItem('custom-email-templates', JSON.stringify(next)); } catch {}
  };

  const addCustomTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateSubject.trim() || !newTemplateContent.trim()) return;
    const key = newTemplateName.trim().toLowerCase().replace(/\s+/g, '-');
    const next = { ...customTemplates, [key]: { subject: newTemplateSubject, content: newTemplateContent } };
    persistCustomTemplates(next);
    setNewTemplateName(''); setNewTemplateSubject(''); setNewTemplateContent('');
    toast({ title: 'Zapisano', description: 'Szablon został zapisany lokalnie.' });
  };

  const deleteCustomTemplate = (key: string) => {
    const next = { ...customTemplates }; delete next[key]; persistCustomTemplates(next);
  };

  const pendingCandidates = candidates.filter(c => c.status === 'pending');
  const contactedCandidates = candidates.filter(c => ['contacted','interviewed','hired'].includes(c.status));
  const archivedCandidates = candidates.filter(c => c.status === 'rejected');

  const resetComposer = () => {
    setTemplateKey(''); setSubject(''); setMessage(''); setAiInstructions(''); setAiTone('neutralny');
  };

  const handleSelectCandidate = (c: Candidate) => {
    setSelectedCandidate(c);
    resetComposer();
  };

  const applyTemplate = (key: TemplateKey, cand: Candidate) => {
    if (!cand) return;
    if (key === 'custom') return; // custom is free-form
    if (key === 'ai-feedback') {
      setSubject(`Feedback dotyczący aplikacji – ${cand.position}`);
      setMessage('');
      return;
    }
    if (key && key in EMAIL_TEMPLATES) {
      const tpl = EMAIL_TEMPLATES[key as BuiltInTemplate];
      setSubject(processTemplate(tpl.subject, cand));
      setMessage(processTemplate(tpl.content, cand));
    }
  };

  const onTemplateChange = (value: TemplateKey) => {
    setTemplateKey(value);
    if (selectedCandidate) applyTemplate(value, selectedCandidate);
  };

  const optimisticStatus = (candidate: Candidate, template: TemplateKey) => {
    let nextStatus: Candidate['status'] = candidate.status;
    if (template === 'negative') nextStatus = 'rejected';
    else if (template === 'positive' || template === 'neutral' || template === 'custom' || template === 'ai-feedback') {
      // For AI we decide based on recommendation
      if (template === 'ai-feedback') {
        if (candidate.cvAnalysis.recommendation === 'reject') nextStatus = 'rejected';
        else nextStatus = 'contacted';
      } else {
        nextStatus = 'contacted';
      }
    }
    if (nextStatus !== candidate.status) {
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: nextStatus } : c));
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedCandidate) return;
    setAiGenerating(true);
    try {
      const temperature = (() => { try { const v = localStorage.getItem('ai-temp'); if (!v) return 0.2; const n = parseFloat(v); return isNaN(n)?0.2:Math.min(1,Math.max(0,n)); } catch { return 0.2; } })();
      const res = await fetch('/api/mail/generate', {
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
            language: 'pl',
            temperature
        })
      });
      if (!res.ok) throw new Error('Błąd generowania');
      const data = await res.json();
      if (data.content) setMessage(data.content);
    } catch (e) {
      console.error(e);
      toast({ title: 'Błąd AI', description: 'Nie udało się wygenerować treści', variant: 'destructive' });
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedCandidate || !templateKey) return;
    if (!message.trim() && templateKey !== 'ai-feedback') return;
    setSending(true);
    try {
      // If ai-feedback chosen and no generated message fallback simple message
      let finalMessage = message;
      if (templateKey === 'ai-feedback' && !finalMessage.trim()) {
        finalMessage = `Cześć ${selectedCandidate.name},\n\nDziękujemy za aplikację. Wkrótce przekażemy szczegółowy feedback.\n\nPozdrawiamy\nZespół Rekrutacji`;
      }
      const res = await fetch('/api/mail/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedCandidate.email,
          candidateName: selectedCandidate.name,
            position: selectedCandidate.position,
          subject: subject || `Feedback – ${selectedCandidate.position}`,
          message: finalMessage,
          template: templateKey,
          candidateId: selectedCandidate.id
        })
      });
      if (!res.ok) throw new Error('Błąd wysyłania');
      toast({ title: 'Wysłano', description: 'Wiadomość została wysłana.' });
      optimisticStatus(selectedCandidate, templateKey);
      setSelectedCandidate(null);
      resetComposer();
    } catch (e) {
      console.error(e);
      toast({ title: 'Błąd', description: 'Nie udało się wysłać wiadomości', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (candidate: Candidate) => {
    if (!confirm(`Usunąć kandydata ${candidate.name}?`)) return;
    const prev = candidates;
    setCandidates(p => p.filter(c => c.id !== candidate.id));
    if (selectedCandidate?.id === candidate.id) setSelectedCandidate(null);
    try {
      const res = await fetch(`/api/recruiter/candidates/${candidate.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast({ title: 'Usunięto', description: 'Kandydat został usunięty.' });
    } catch (e) {
      console.error(e);
      setCandidates(prev); // rollback
      toast({ title: 'Błąd', description: 'Nie udało się usunąć kandydata', variant: 'destructive' });
    }
  };

  const manualMove = (candidate: Candidate, target: 'contacted' | 'rejected') => {
    setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: target } : c));
    if (selectedCandidate?.id === candidate.id) {
      setSelectedCandidate({ ...candidate, status: target });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wiadomości</h1>
          <p className="text-muted-foreground text-sm">Zarządzaj komunikacją z kandydatami (bez zakładki historii).</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">{pendingCandidates.length} oczekujących</span>
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{contactedCandidates.length} skontaktowanych</span>
          <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-400">{archivedCandidates.length} archiwum</span>
        </div>
      </div>

      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="candidates">Kandydaci ({pendingCandidates.length})</TabsTrigger>
          <TabsTrigger value="contacted">Skontaktowani ({contactedCandidates.length})</TabsTrigger>
          <TabsTrigger value="archived">Archiwum ({archivedCandidates.length})</TabsTrigger>
          <TabsTrigger value="templates">Szablony</TabsTrigger>
        </TabsList>

        {/* Pending candidates + composer */}
        <TabsContent value="candidates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Oczekujący</CardTitle>
                <CardDescription>Lista kandydatów bez feedbacku</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading && (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ładowanie...
                  </div>
                )}
                {!loading && pendingCandidates.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" /> Brak kandydatów.
                  </div>
                )}
                {!loading && pendingCandidates.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCandidate(c)}
                    className={`group border rounded-md p-3 text-sm transition-colors cursor-pointer ${selectedCandidate?.id === c.id ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/40'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.position}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); manualMove(c,'contacted'); }}>Kontakt</Button>
                        <Button variant="outline" size="sm" className="text-rose-500" onClick={(e) => { e.stopPropagation(); manualMove(c,'rejected'); }}>Odrzuć</Button>
                        <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(c); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">Wynik {c.cvAnalysis.score}</Badge>
                      <span>{c.cvAnalysis.recommendation}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle>Wiadomość</CardTitle>
                <CardDescription>{selectedCandidate ? `Do: ${selectedCandidate.name}` : 'Wybierz kandydata z listy po lewej'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedCandidate && (
                  <p className="text-sm text-muted-foreground">Brak wybranego kandydata.</p>
                )}
                {selectedCandidate && (
                  <>
                    <div className="space-y-2">
                      <Label>Szablon</Label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {(['positive','neutral','negative','ai-feedback','custom'] as TemplateKey[]).map(t => (
                          <Button
                            key={t}
                            type="button"
                            variant={templateKey === t ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onTemplateChange(t)}
                          >
                            {t === 'positive' && 'Pozytywny'}
                            {t === 'neutral' && 'Neutralny'}
                            {t === 'negative' && 'Negatywny'}
                            {t === 'ai-feedback' && 'AI'}
                            {t === 'custom' && 'Własny'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Temat</Label>
                      <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Temat wiadomości" />
                    </div>
                    {templateKey === 'ai-feedback' && (
                      <div className="space-y-2">
                        <Label>Instrukcje dla AI (opcjonalne)</Label>
                        <Textarea rows={3} value={aiInstructions} onChange={e=>setAiInstructions(e.target.value)} placeholder="Np. podkreśl umiejętności front-end" />
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" disabled={aiGenerating} onClick={handleGenerateAI}>
                            {aiGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Bot className="h-4 w-4 mr-2" />}
                            {aiGenerating ? 'Generowanie...' : 'Wygeneruj treść'}
                          </Button>
                          <span className="text-[10px] text-muted-foreground">Używa aktualnego ustawienia temperatury AI</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Treść</Label>
                      <Textarea rows={10} value={message} onChange={e=>setMessage(e.target.value)} placeholder={templateKey === 'ai-feedback' ? 'Wygeneruj lub wklej treść...' : 'Treść wiadomości'} />
                    </div>
                    <Button
                      disabled={!templateKey || sending || (templateKey !== 'ai-feedback' && !message.trim())}
                      onClick={handleSend}
                      className="w-full"
                    >
                      {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      {sending ? 'Wysyłanie...' : 'Wyślij'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacted */}
        <TabsContent value="contacted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skontaktowani</CardTitle>
              <CardDescription>Kandydaci z wysłanym feedbackiem lub dalej w procesie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contactedCandidates.length === 0 && <p className="text-sm text-muted-foreground">Brak kandydatów.</p>}
              {contactedCandidates.map(c => (
                <div key={c.id} className="p-3 border rounded-md text-sm flex flex-col gap-1 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.position}</span>
                  <span className="text-[10px] text-muted-foreground">{c.email}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Archived */}
        <TabsContent value="archived" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archiwum</CardTitle>
              <CardDescription>Odrzuceni kandydaci.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {archivedCandidates.length === 0 && <p className="text-sm text-muted-foreground">Brak kandydatów.</p>}
              {archivedCandidates.map(c => (
                <div key={c.id} className="p-3 border rounded-md text-sm flex flex-col gap-1 bg-rose-500/5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{c.name}</span>
                    <Badge variant="outline" className="text-[10px] text-rose-500">{c.status}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.position}</span>
                  <span className="text-[10px] text-muted-foreground">{c.email}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wbudowane szablony</CardTitle>
              <CardDescription>Kliknij aby podejrzeć zawartość.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {(['positive','neutral','negative'] as BuiltInTemplate[]).map(key => {
                  const t = EMAIL_TEMPLATES[key];
                  return (
                    <div key={key} className="p-4 border rounded-md space-y-2 text-xs bg-muted/30">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        {key === 'positive' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {key === 'neutral' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        {key === 'negative' && <XCircle className="h-4 w-4 text-red-500" />}
                        <span>{key === 'positive' ? 'Pozytywny' : key === 'neutral' ? 'Neutralny' : 'Negatywny'}</span>
                      </div>
                      <div><span className="font-medium">Temat:</span> {t.subject}</div>
                      <div className="whitespace-pre-line max-h-40 overflow-hidden border bg-background p-2 rounded">
                        {t.content}
                      </div>
                    </div>
                  );
                })}
                <div className="p-4 border rounded-md space-y-2 text-xs border-dashed">
                  <div className="flex items-center gap-2 font-semibold text-sm text-blue-600">
                    <MessageSquare className="h-4 w-4" /> AI Feedback
                  </div>
                  <p>Dynamicznie generowany na podstawie analizy CV.</p>
                  <p className="text-muted-foreground">Placeholders: <code>{'{'}{'{'}candidateName{'}'}{'}'}</code>, <code>{'{'}{'{'}position{'}'}{'}'}</code>, <code>{'{'}{'{'}score{'}'}{'}'}</code>, sekcje strengths / weaknesses.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Własne szablony</CardTitle>
              <CardDescription>Przechowywane lokalnie (localStorage).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(customTemplates).length === 0 && (
                  <p className="text-sm text-muted-foreground md:col-span-2">Brak własnych szablonów.</p>
                )}
                {Object.entries(customTemplates).map(([key, tpl]) => (
                  <div key={key} className="p-3 border rounded-md text-xs space-y-2 relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{key}</span>
                      <div className="flex gap-1">
                        <Button variant="secondary" size="sm" onClick={() => { setTemplateKey('custom'); setSubject(tpl.subject); setMessage(tpl.content); toast({ title: 'Załadowano', description: 'Szablon wczytany do edycji.' }); }}>Użyj</Button>
                        <Button variant="outline" size="sm" onClick={() => { setNewTemplateName(key); setNewTemplateSubject(tpl.subject); setNewTemplateContent(tpl.content); }}>Edytuj</Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteCustomTemplate(key)}>Usuń</Button>
                      </div>
                    </div>
                    <div className="text-muted-foreground truncate">Temat: {tpl.subject}</div>
                    <div className="text-muted-foreground whitespace-pre-line max-h-24 overflow-hidden border bg-background p-2 rounded">{tpl.content}</div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-sm">Dodaj / edytuj szablon</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nazwa</Label>
                    <Input value={newTemplateName} onChange={e=>setNewTemplateName(e.target.value)} placeholder="np. follow-up" />
                  </div>
                  <div className="space-y-2">
                    <Label>Temat</Label>
                    <Input value={newTemplateSubject} onChange={e=>setNewTemplateSubject(e.target.value)} placeholder="Temat wiadomości" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Treść</Label>
                  <Textarea rows={6} value={newTemplateContent} onChange={e=>setNewTemplateContent(e.target.value)} placeholder="Treść z placeholderami ({{candidateName}} etc.)" />
                </div>
                <div className="flex gap-2">
                  <Button disabled={!newTemplateName || !newTemplateSubject || !newTemplateContent} onClick={addCustomTemplate}>Zapisz</Button>
                  <Button variant="outline" type="button" onClick={() => { setNewTemplateName(''); setNewTemplateSubject(''); setNewTemplateContent(''); }}>Wyczyść</Button>
                </div>
                <p className="text-xs text-muted-foreground">Dostępne placeholders: <code>{'{'}{'{'}candidateName{'}'}{'}'}</code>, <code>{'{'}{'{'}position{'}'}{'}'}</code>, <code>{'{'}{'{'}score{'}'}{'}'}</code>, sekcje strengths / weaknesses.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}