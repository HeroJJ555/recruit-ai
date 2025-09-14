import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log("📋 Messages API: Fetching candidates for feedback");
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch candidates with their CV analysis and real status
    const candidates = await prisma.candidateApplication.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        experience: true,
        skills: true,
        cvFileName: true,
        createdAt: true,
        status: true,
        cvAnalysis: {
          select: {
            matchScore: true,
            summary: true,
            technicalSkills: true,
            aiProvider: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    console.log(`✅ Found ${candidates.length} candidates`);

    // Transform candidates to match expected format
    const transformedCandidates = candidates.map(candidate => {
      const fullName = `${candidate.firstName} ${candidate.lastName}`;
      const score = candidate.cvAnalysis?.matchScore || 0;
      
      // Extract technical skills from JSON
      const technicalSkills = candidate.cvAnalysis?.technicalSkills as any[] || [];
      const skillNames = Array.isArray(technicalSkills) 
        ? technicalSkills.map(skill => typeof skill === 'string' ? skill : skill.name || skill.skill).filter(Boolean)
        : [];

      // Generate strengths and weaknesses based on score and data
      const strengths = [];
      const weaknesses = [];

      // Add strengths based on available data
      if (candidate.experience && candidate.experience !== 'junior') {
        strengths.push(`${candidate.experience} poziom doświadczenia`);
      }
      if (skillNames.length > 0) {
        strengths.push(`Znajomość: ${skillNames.slice(0, 3).join(', ')}`);
      }
      if (candidate.cvFileName) {
        strengths.push('Kompletna dokumentacja aplikacyjna');
      }
      if (score >= 70) {
        strengths.push('Wysokie dopasowanie do wymagań stanowiska');
      }

      // Add weaknesses based on score and missing data
      if (score < 50) {
        weaknesses.push('Niskie dopasowanie do wymagań stanowiska');
      }
      if (!candidate.cvAnalysis) {
        weaknesses.push('Brak analizy CV przez AI');
      }
      if (skillNames.length === 0) {
        weaknesses.push('Brak szczegółowych informacji o umiejętnościach technicznych');
      }
      if (candidate.experience === 'junior' && score < 60) {
        weaknesses.push('Ograniczone doświadczenie zawodowe');
      }

      // Determine recommendation based on score
      let recommendation: 'hire' | 'maybe' | 'reject' = 'reject';
      if (score >= 75) recommendation = 'hire';
      else if (score >= 50) recommendation = 'maybe';

      // Map DB enum (ApplicationStatus) to UI buckets used in messages component
      const rawStatus = (candidate as any).status as string | undefined;
      let uiStatus: 'pending' | 'contacted' | 'interviewed' | 'hired' | 'rejected' = 'pending';
      if (rawStatus) {
        switch (rawStatus) {
          case 'PENDING':
          case 'REVIEWED':
          case 'WAITING':
            uiStatus = 'pending'; break;
          case 'CONTACTED':
            uiStatus = 'contacted'; break;
          case 'INTERVIEW':
          case 'INTERVIEW_SCHEDULED':
          case 'INTERVIEW_COMPLETED':
            uiStatus = 'interviewed'; break;
          case 'HIRED':
            uiStatus = 'hired'; break;
          case 'REJECTED':
          case 'WITHDRAWN':
            uiStatus = 'rejected'; break;
          default:
            uiStatus = 'pending';
        }
      }

      return {
        id: candidate.id,
        name: fullName,
        email: candidate.email,
        position: candidate.position,
        cvAnalysis: {
          score: Math.round(score),
          strengths: strengths.length > 0 ? strengths : ['Aplikacja została przesłana'],
          weaknesses: weaknesses.length > 0 ? weaknesses : [],
          recommendation
        },
        appliedDate: candidate.createdAt.toISOString().split('T')[0],
        status: uiStatus,
        experience: candidate.experience,
        skills: candidate.skills,
        aiProvider: candidate.cvAnalysis?.aiProvider || null,
        summary: candidate.cvAnalysis?.summary || null
      };
    });

    return NextResponse.json({
      candidates: transformedCandidates,
      total: transformedCandidates.length
    });

  } catch (error) {
    console.error("💥 Messages API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}