'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Mail, Phone, Calendar, User } from 'lucide-react';

interface CandidateDetailsProps {
  candidate: {
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
    status: string;
  };
}

export default function CandidateDetails({ candidate }: CandidateDetailsProps) {
  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maybe':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'reject':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return 'text-green-700 bg-green-100';
      case 'maybe':
        return 'text-yellow-700 bg-yellow-100';
      case 'reject':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'hire':
        return 'Zatrudnij';
      case 'maybe':
        return 'Do rozważenia';
      case 'reject':
        return 'Odrzuć';
      default:
        return 'Nieznane';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="text-xl">{candidate.name}</CardTitle>
              <CardDescription>{candidate.position}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getRecommendationIcon(candidate.cvAnalysis.recommendation)}
            <Badge className={getRecommendationColor(candidate.cvAnalysis.recommendation)}>
              {getRecommendationText(candidate.cvAnalysis.recommendation)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Aplikacja: {candidate.appliedDate}</span>
          </div>
        </div>

        {/* CV Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Ocena CV</h4>
            <span className={`font-bold ${getScoreColor(candidate.cvAnalysis.score)}`}>
              {candidate.cvAnalysis.score}/100
            </span>
          </div>
          <Progress 
            value={candidate.cvAnalysis.score} 
            className="h-2"
          />
        </div>

        {/* Strengths */}
        {candidate.cvAnalysis.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Mocne strony
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {candidate.cvAnalysis.strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {candidate.cvAnalysis.weaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Obszary do poprawy
            </h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {candidate.cvAnalysis.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendation Summary */}
        <div className={`p-4 rounded-lg border ${getRecommendationColor(candidate.cvAnalysis.recommendation)} border-current/20`}>
          <div className="flex items-center gap-2 mb-2">
            {getRecommendationIcon(candidate.cvAnalysis.recommendation)}
            <h4 className="font-medium">Rekomendacja</h4>
          </div>
          <p className="text-sm">
            {candidate.cvAnalysis.recommendation === 'hire' && 
              'Kandydat spełnia wymagania stanowiska i może być zaproszony na rozmowę kwalifikacyjną.'}
            {candidate.cvAnalysis.recommendation === 'maybe' && 
              'Kandydat ma potencjał, ale wymaga dodatkowej weryfikacji przed podjęciem decyzji.'}
            {candidate.cvAnalysis.recommendation === 'reject' && 
              'Kandydat nie spełnia kluczowych wymagań stanowiska w obecnej formie.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}