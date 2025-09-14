const { PrismaClient } = require('@prisma/client');

async function checkCandidates() {
  const prisma = new PrismaClient();
  
  try {
    const candidates = await prisma.candidateApplication.findMany();
    
    console.log(`Kandydaci w bazie: ${candidates.length}`);
    
    if (candidates.length > 0) {
      console.log('\nLista kandydatów:');
      candidates.forEach(c => {
        console.log(`- ${c.firstName} ${c.lastName} (${c.email}) - Status: ${c.status}`);
      });
    } else {
      console.log('\nBrak kandydatów w bazie danych!');
    }
  } catch (error) {
    console.error('Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCandidates();