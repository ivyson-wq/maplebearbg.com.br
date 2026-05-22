// Gera 6 páginas individuais /estagios/<slug>/index.html
// — uma por estágio: Bear Care, Toddler, Nursery, JK, SK, Year 1
// Cada página tem hero + curriculum + rotina + FAQ + CTA WhatsApp, com JSON-LD por estágio.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'estagios');
const WA = '5554999315480';

const STAGES = [
  {
    slug: 'bear-care', n: '01', name: 'Bear Care', age: '18 meses', range: '18 meses',
    color: ['#F4DBCB', '#E84A5F'],
    tagline: 'A primeira casa fora de casa.',
    intro: 'O Bear Care é o primeiro contato do bebê com um ambiente bilíngue. Aos 18 meses, cada choro é acolhido, cada descoberta é celebrada. A imersão em inglês acontece através de música, histórias e afeto — nunca como esforço.',
    why: 'A neurociência mostra que a janela mais larga de plasticidade cerebral pra aquisição de língua começa antes dos 2 anos. Crianças expostas a um segundo idioma nesse período desenvolvem os dois sistemas linguísticos como se fossem nativos em ambos — sem sotaque marcado, sem esforço consciente, sem barreira tradutória.',
    curriculum: [
      ['Linguagem', 'Exposição contínua a inglês e português via canções, leitura compartilhada e nomeação verbal de objetos e ações'],
      ['Desenvolvimento motor', 'Estimulação da motricidade ampla (engatinhar, andar, subir) e fina (pinças, pegar objetos pequenos com segurança)'],
      ['Sensorial', 'Atividades com diferentes texturas, sons, cheiros e temperaturas em ambiente controlado'],
      ['Vínculo', 'Construção de relação segura com cuidadores bilíngues, base pra todo o desenvolvimento posterior'],
      ['Autonomia inicial', 'Primeiras escolhas: brinquedo, livro, lugar pra sentar'],
      ['Sono e alimentação', 'Rotinas individualizadas respeitando o ritmo de cada bebê']
    ],
    routine: [
      ['Chegada', 'Acolhimento individual, despedida tranquila da família'],
      ['Roda da manhã', 'Canções em inglês e português, "Good morning" coletivo'],
      ['Brincadeira livre', 'Exploração orientada com material sensorial e didático'],
      ['Refeições', 'Atendimento individual, respeito ao ritmo'],
      ['Cochilo', 'Sono respeitado por janela individual de cada bebê'],
      ['Atividade dirigida', 'Story time, música, arte sensorial'],
      ['Saída', 'Relatório do dia para a família'],
    ],
    faq: [
      ['Meu bebê de 18 meses ainda não fala. Vai conseguir acompanhar?', 'Sim. No Bear Care a linguagem é receptiva muito antes de produtiva. O bebê absorve sons, ritmos e contextos das duas línguas sem precisar falar. Quando começar a falar — geralmente entre 18 e 24 meses — vai falar palavras nas duas línguas naturalmente.'],
      ['Como funciona a adaptação?', 'Adaptação gradual em uma a duas semanas. Família participa nos primeiros dias, depois reduz presença até a criança ficar tranquila sozinha. Não há "fórmula" — cada bebê tem seu ritmo.'],
      ['Quantos bebês por turma?', 'Turmas pequenas com proporção adulto/criança alta. Detalhes específicos em visita.'],
    ]
  },
  {
    slug: 'toddler', n: '02', name: 'Toddler', age: '2 anos', range: '2 anos',
    color: ['#FBE6C5', '#C9923D'],
    tagline: 'A linguagem explode — em duas.',
    intro: 'Aos 2 anos, o vocabulário explode. Na Maple Bear, ele explode nas duas línguas ao mesmo tempo, sem tradução. Mom e mamãe, water e água, book e livro convivem na cabeça da criança como mundos paralelos perfeitamente funcionais.',
    why: 'O Toddler é o estágio dos "primeiros eus" — primeiras frases, primeiras decisões, primeiras frustrações resolvidas. Em ambiente bilíngue acolhedor, a criança aprende não só a falar, mas a regular emoções nos dois idiomas. Habilidade que dura a vida toda.',
    curriculum: [
      ['Linguagem expressiva', 'Construção de frases simples em inglês e português, expansão acelerada de vocabulário'],
      ['Brincadeira simbólica', 'Faz-de-conta, jogo de papéis, narrativa inicial'],
      ['Autonomia', 'Vestir-se com ajuda, comer sozinho, usar o banheiro, escolher atividades'],
      ['Socialização', 'Primeiras interações regulares com pares, compartilhar, esperar a vez'],
      ['Pré-leitura', 'Story time diário, manipulação de livros, reconhecimento de capas'],
      ['Pensamento espacial', 'Encaixes, sequências, classificação por cor/forma/tamanho'],
    ],
    routine: [
      ['Chegada', 'Acolhimento, despedida ritualizada'],
      ['Roda da manhã', '"Good morning circle" com música e calendário'],
      ['Atividade dirigida 1', 'Linguagem, arte ou matemática concreta'],
      ['Lanche', 'Rotina alimentar com autonomia crescente'],
      ['Brincadeira no parque', 'Movimento ao ar livre, brincadeira espontânea'],
      ['Almoço', 'Refeição com autonomia, talher próprio'],
      ['Cochilo', 'Descanso individual'],
      ['Atividade dirigida 2', 'Story time, música, expressão'],
      ['Saída', 'Despedida individual'],
    ],
    faq: [
      ['Meu filho mistura inglês e português na mesma frase. É normal?', 'Sim, totalmente. Chama-se "mistura de códigos" e é sinal de que o cérebro está processando ambos os idiomas ativamente. Some por volta dos 4-5 anos, quando a criança naturalmente separa os contextos.'],
      ['Ele não fala muito ainda. Devo me preocupar?', 'Cada criança tem seu ritmo. No Toddler trabalhamos linguagem receptiva e expressiva em conjunto. Se houver preocupação, conversamos individualmente — temos parceria com fonoaudiologia quando necessário.'],
      ['Pode entrar direto no Toddler sem ter passado pelo Bear Care?', 'Sim. Crianças entrando aos 2 anos sem experiência prévia bilíngue adaptam normalmente com nossa metodologia de imersão suave.'],
    ]
  },
  {
    slug: 'nursery', n: '03', name: 'Nursery', age: '3 anos', range: '3 anos',
    color: ['#C8E6D0', '#2D4A3E'],
    tagline: 'O mundo começa a se abrir.',
    intro: 'Aos 3 anos, o "porquê" entra em cena. A criança Nursery quer entender tudo — e quer entender em duas línguas. Letras, números, cores, formas começam a fazer sentido. Curiosidade vira pergunta, pergunta vira projeto.',
    why: 'O Nursery é o estágio em que a criança começa a aprender de forma estruturada — mas ainda sem perder o jeito brincante de aprender. É o melhor dos dois mundos: rigor crescente, alegria intacta. Projetos investigativos guiados pelo interesse específico de cada turma.',
    curriculum: [
      ['Pré-leitura', 'Reconhecimento de letras (alfabeto inglês e português), iniciação à consciência fonêmica'],
      ['Pré-escrita', 'Traços, movimento da mão, primeiros desenhos com intenção'],
      ['Matemática inicial', 'Quantificação até 10, ordinais, classificação, padrões simples'],
      ['Ciências', 'Observação da natureza, experimentos sensoriais, perguntas guiadas'],
      ['Artes', 'Exploração de materiais, técnica básica, expressão pessoal'],
      ['Educação socioemocional', 'Identificação de emoções, regulação inicial, empatia'],
    ],
    routine: [
      ['Chegada', 'Roda da manhã expandida'],
      ['Story time bilíngue', 'Leitura interativa com perguntas'],
      ['Centro de aprendizagem', 'Estações de matemática, leitura, ciências, arte'],
      ['Lanche', 'Conversa estruturada na mesa'],
      ['Brincadeira ao ar livre', 'Movimento intencional, brincadeira social'],
      ['Almoço', 'Etiqueta inicial, autonomia plena'],
      ['Repouso', 'Descanso reduzido (algumas crianças já não dormem)'],
      ['Projeto investigativo', 'Trabalho contínuo em projeto da turma'],
      ['Saída', 'Roda de despedida'],
    ],
    faq: [
      ['Meu filho de 3 anos sabe falar inglês?', 'Depende do tempo de exposição. Crianças que vêm do Toddler ou Bear Care já entendem tudo e produzem frases. Crianças entrando aos 3 anos atingem compreensão funcional em 3-6 meses.'],
      ['Como funcionam os projetos investigativos?', 'A turma escolhe um tema de interesse (ex: dinossauros, oceano, padaria). Por 2-4 semanas, exploramos esse tema com leitura, arte, matemática, ciência, drama. Todas as disciplinas convergem no projeto. Aprende-se profundamente, não superficialmente.'],
      ['Tem dever de casa?', 'Não no sentido tradicional. Pedimos eventualmente que a família converse sobre algo, traga um objeto, ou observe algo em casa.'],
    ]
  },
  {
    slug: 'junior-kindergarten', n: '04', name: 'Junior Kindergarten', age: '4 anos', range: '4 anos', shortName: 'JK',
    color: ['#E8B4BC', '#8B0A1F'],
    tagline: 'O pensamento ganha estrutura.',
    intro: 'O Junior Kindergarten é onde a criança começa a pensar sobre como pensa. Pré-alfabetização ganha foco nas duas línguas. O pensamento matemático começa a estruturar — classificar, comparar, ordenar, perceber padrões.',
    why: 'O JK é a transição entre "aprender brincando" e "aprender fazendo". A criança ainda brinca, mas a brincadeira agora tem objetivos pedagógicos claros. É a porta de entrada pra alfabetização — em duas línguas simultaneamente.',
    curriculum: [
      ['Pré-alfabetização', 'Reconhecimento de sons (fonemas) em inglês e português, associação letra-som, primeiras palavras lidas'],
      ['Pré-escrita', 'Controle motor fino, primeiras letras escritas, formação do próprio nome'],
      ['Matemática concreta', 'Contagem até 20, comparação, classificação em múltiplos critérios, padrões'],
      ['Ciências por investigação', 'Experimentos guiados, observação sistemática, primeira hipótese'],
      ['Letramento literário', 'Histórias com narrativa complexa, primeiras inferências, recontar'],
      ['Habilidades sociais', 'Trabalho em pares e pequenos grupos, escuta ativa, resolução de conflito mediada'],
    ],
    routine: [
      ['Chegada', 'Calendário do dia, agenda dos projetos'],
      ['Read aloud', 'Story time com discussão estruturada'],
      ['Literacy block', 'Foco em letras, sons, palavras'],
      ['Lanche', 'Conversa estruturada'],
      ['Math block', 'Manipulação matemática, jogos numéricos'],
      ['Recreio', 'Brincadeira livre supervisionada'],
      ['Almoço', 'Autonomia plena'],
      ['Inquiry/Projeto', 'Trabalho em projeto investigativo'],
      ['Arte ou Movimento', 'Expressão criativa ou educação física'],
      ['Saída', 'Sumário do dia, agenda pra família'],
    ],
    faq: [
      ['Ele vai aprender a ler aos 4 anos?', 'Alguns sim, outros não. A leitura emerge entre 4 e 6 anos dependendo de cada criança. No JK, garantimos que TODOS tenham as pré-condições (fonemas, vocabulário, motivação) pra ler quando estiverem prontos.'],
      ['Em qual língua aprende a ler primeiro?', 'Em ambas, em paralelo. Não forçamos uma "primeira" língua de alfabetização. Cada criança tem sua porta de entrada — algumas começam pelo inglês, outras pelo português. Por volta dos 6-7 anos, leem nas duas.'],
      ['Ele já pode mudar de escola pro Ensino Fundamental tradicional?', 'Sim, com ressalva. Crianças saindo do JK ou SK Maple Bear conseguem acompanhar qualquer escola tradicional. Mas perdem a continuidade bilíngue — por isso recomendamos seguir até o Year 1 (2027) na Maple Bear.'],
    ]
  },
  {
    slug: 'senior-kindergarten', n: '05', name: 'Senior Kindergarten', age: '5 anos', range: '5 anos', shortName: 'SK',
    color: ['#F4DBCB', '#C8102E'],
    tagline: 'O leitor em formação.',
    intro: 'Aos 5 anos, o Senior Kindergarten Maple Bear forma o leitor. Leitura autônoma em inglês e português, matemática concreta com manipulação e jogos, educação socioemocional integrada ao dia. Preparação completa pra entrada no Fundamental.',
    why: 'O SK é o ano da consolidação. Tudo que veio antes — vocabulário das duas línguas, hábitos de aprendizado, regulação emocional — agora se estrutura em ferramentas que a criança vai levar pro Year 1 e além. Aos 5 anos, sai do SK uma criança que ama ler, pensa criticamente, e se sente confortável no mundo bilíngue.',
    curriculum: [
      ['Leitura autônoma', 'Leitura de palavras e frases simples em inglês e português; emergência da fluência'],
      ['Escrita inicial', 'Escrita de palavras, primeiras frases, expressão de ideias por escrito'],
      ['Matemática operatória', 'Adição e subtração com material concreto, conceito de quantidade ampliado, primeiras estratégias'],
      ['Ciências e investigação', 'Método científico inicial: pergunta, hipótese, experimento, conclusão'],
      ['Estudos sociais', 'Família, comunidade, cidade, primeira noção de mundo'],
      ['Habilidades pra Year 1', 'Resistência atencional, organização de material, autonomia plena'],
    ],
    routine: [
      ['Chegada', 'Morning meeting estruturado, calendário, agenda'],
      ['Reading workshop', 'Leitura compartilhada e individual em ambas as línguas'],
      ['Writing workshop', 'Produção escrita com plano e revisão simples'],
      ['Matemática', 'Bloco estruturado com manipulação e jogos'],
      ['Lanche', 'Conversa social'],
      ['Inquiry/Projeto', 'Projeto de longa duração investigativo'],
      ['Almoço', 'Autonomia e socialização'],
      ['Recreio', 'Movimento livre'],
      ['Especialistas', 'Música, arte, educação física com professores especialistas'],
      ['Closing circle', 'Reflexão do dia, planejamento do próximo'],
      ['Saída', 'Despedida individual'],
    ],
    faq: [
      ['Meu filho sai do SK pronto pro Year 1?', 'Sim, com folga. O SK Maple Bear prepara além do que o Fundamental tradicional brasileiro exige. Em duas línguas, com habilidades de pesquisa, escrita e pensamento crítico que vão fazer diferença a vida toda.'],
      ['Se ele entrar só agora no SK, sem ter feito JK Maple Bear, vai acompanhar?', 'Sim. Recebemos crianças entrando direto no SK. Há período de adaptação à metodologia (1-3 meses) e à imersão bilíngue (3-6 meses), mas a criança chega ao final do ano no mesmo ponto.'],
      ['Tem prova ou avaliação numérica?', 'Não. Avaliamos por portfólio: registros qualitativos contínuos com fotos, vídeos, produções e observações. Famílias recebem retratos detalhados do desenvolvimento — não notas.'],
    ]
  },
  {
    slug: 'year-1', n: '06', name: 'Year 1', age: '6-7 anos', range: '6 — 7 anos', shortName: 'Y1', featured: true, year: '2027',
    color: ['#2A2522', '#C8102E'],
    tagline: 'A entrada no Fundamental.',
    intro: 'Em 2027, abrimos o Year 1 — primeiro ano do Ensino Fundamental brasileiro, em duas línguas, no mesmo lugar. A criança que entrou aos 18 meses pode agora seguir até os 7 anos sem precisar dizer adeus, sem ruptura, sem perder o ritmo.',
    why: 'A continuidade pedagógica entre Educação Infantil e Fundamental é raríssima no Brasil — a maioria das escolas bilíngues termina aos 5 anos, e a criança tem que migrar pra outra escola tradicional. No Year 1 Maple Bear Bento Gonçalves, essa ruptura desaparece. Currículo canadense alinhado à BNCC. Alfabetização plena bilíngue. Professores em formação contínua. Pré-matrículas abertas.',
    curriculum: [
      ['Alfabetização plena', 'Leitura e escrita autônomas em inglês e português, vocabulário acadêmico ampliado'],
      ['Matemática', 'Operações até 100, resolução de problemas, raciocínio lógico, frações iniciais'],
      ['Ciências da Natureza', 'Observação, classificação, experimentação científica básica'],
      ['Ciências Humanas', 'História da cidade, geografia local, primeira noção de cidadania'],
      ['Linguagens', 'Português e inglês como sistemas próprios, ampliação de gêneros textuais'],
      ['Arte e Música', 'Apreciação e produção com professores especialistas'],
      ['Educação Física', 'Coordenação, esportes coletivos, jogos cooperativos'],
      ['Educação socioemocional', 'Continuidade do programa Maple Bear integrado ao dia'],
    ],
    routine: [
      ['Chegada', 'Morning meeting expandido com planejamento do dia'],
      ['Língua Portuguesa', 'Bloco de leitura, escrita e oralidade'],
      ['English', 'Bloco integral em inglês: linguagem, literatura, expressão'],
      ['Lanche', 'Convivência estruturada'],
      ['Matemática', 'Bloco com manipulação concreta + estratégias'],
      ['Recreio', 'Brincadeira supervisionada'],
      ['Almoço', 'Refeição completa, etiqueta'],
      ['Ciências/História/Geografia', 'Conteúdos disciplinares contextualizados'],
      ['Especialistas', 'Arte, Música, Educação Física conforme cronograma'],
      ['Estudo dirigido', 'Trabalho independente com apoio'],
      ['Closing', 'Reflexão e preparação pra casa'],
    ],
    faq: [
      ['O Year 1 é reconhecido como 1º ano do Fundamental no Brasil?', 'Sim. Year 1 = 1º ano do Ensino Fundamental brasileiro. Currículo canadense Maple Bear alinhado à BNCC (Base Nacional Comum Curricular). Documentação escolar segue padrão MEC.'],
      ['Quando começam as pré-matrículas pra 2027?', 'Já estão abertas. Entre em contato pelo WhatsApp pra reservar vaga e conhecer condições.'],
      ['Quantas vagas vão abrir?', 'Turmas pequenas — número exato definido conforme cronograma de obras e estrutura. Inscrições por ordem de pré-matrícula.'],
      ['Crianças que vêm de outra escola podem entrar direto no Year 1?', 'Sim. Há entrevista pedagógica e período de adaptação. Crianças com inglês forte se adaptam rápido; sem inglês prévio também conseguem, com apoio extra nos primeiros meses.'],
    ]
  }
];

function escapeAttr(s) { return s.replace(/"/g, '&quot;'); }

function render(stage) {
  const url = `https://maplebearbg.com.br/estagios/${stage.slug}/`;
  const fullName = stage.shortName ? `${stage.name} (${stage.shortName})` : stage.name;
  const yearLabel = stage.year ? ` · ${stage.year}` : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#C8102E">

<title>${stage.name} (${stage.range}) · Maple Bear Bento Gonçalves</title>
<meta name="description" content="${escapeAttr(stage.intro.replace(/<[^>]+>/g, '').slice(0, 160))}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">

<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Maple Bear Bento Gonçalves">
<meta property="og:title" content="${stage.name} (${stage.range}) · Maple Bear Bento Gonçalves">
<meta property="og:description" content="${escapeAttr(stage.intro.replace(/<[^>]+>/g, '').slice(0, 160))}">
<meta property="og:url" content="${url}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Spectral:ital,wght@0,200..800;1,200..800&family=Caveat:wght@500;600&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">

<!-- JSON-LD: EducationalOccupationalProgram + BreadcrumbList + FAQ -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOccupationalProgram",
  "name": "${stage.name} — Maple Bear Bento Gonçalves",
  "description": "${escapeAttr(stage.intro.replace(/<[^>]+>/g, '').slice(0, 280))}",
  "url": "${url}",
  "educationalProgramMode": "Bilíngue (inglês + português)",
  "typicalAgeRange": "${stage.range}",
  "provider": {
    "@type": "EducationalOrganization",
    "@id": "https://maplebearbg.com.br/#school"
  }
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://maplebearbg.com.br/" },
    { "@type": "ListItem", "position": 2, "name": "Faixas etárias", "item": "https://maplebearbg.com.br/estagios/" },
    { "@type": "ListItem", "position": 3, "name": "${stage.name}", "item": "${url}" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    ${stage.faq.map(([q, a]) => `{ "@type": "Question", "name": "${escapeAttr(q)}", "acceptedAnswer": { "@type": "Answer", "text": "${escapeAttr(a)}" } }`).join(',\n    ')}
  ]
}
</script>

<style>
  :root {
    --paper: #FBF7F0; --paper-deep: #F4ECDF; --paper-shade: #EBE0CC;
    --ink: #2A2522; --ink-soft: #5C544D; --ink-faint: #8A7F75;
    --maple: #C8102E; --maple-deep: #8B0A1F; --maple-soft: #E84A5F;
    --honey: #C9923D; --blush: #F4DBCB;
    --stage-from: ${stage.color[0]}; --stage-to: ${stage.color[1]};
    --shadow-soft: 0 14px 30px -18px rgba(42, 37, 34, 0.18);
    --shadow: 0 30px 60px -25px rgba(42, 37, 34, 0.25);
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'Spectral', Georgia, serif;
    --font-script: 'Caveat', cursive;
  }
  *,*::before,*::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--font-body); font-size: 1.1rem; line-height: 1.7; -webkit-font-smoothing: antialiased; }
  a { color: var(--maple); text-decoration: none; transition: color .2s; }
  ::selection { background: var(--maple); color: var(--paper); }

  .site-nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: 1.1rem clamp(1.25rem, 4vw, 2.5rem); background: rgba(251,247,240,0.92); backdrop-filter: blur(14px); border-bottom: 1px solid var(--paper-shade); }
  .brand { display: flex; align-items: center; gap: 0.7rem; color: var(--ink); }
  .brand-mark { width: 44px; height: 44px; display: block; flex-shrink: 0; filter: drop-shadow(0 4px 8px rgba(200,16,46,0.18)); }
  .brand-text { display: flex; flex-direction: column; line-height: 1.05; }
  .brand-line-1 { font-weight: 600; font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; color: var(--maple); font-family: var(--font-body); }
  .brand-line-2 { font-weight: 500; font-size: 1.15rem; font-style: italic; color: var(--ink); font-family: var(--font-display); margin-top: 1px; }
  .nav-links { display: flex; align-items: center; gap: 1.4rem; }
  .nav-links a { color: var(--ink-soft); font-family: var(--font-body); font-size: .95rem; font-weight: 500; }
  .nav-links a:hover { color: var(--maple); }
  .nav-cta { background: var(--maple); color: var(--paper) !important; padding: .6rem 1.1rem; border-radius: 999px; }
  .nav-cta:hover { background: var(--maple-deep); }
  @media (max-width: 640px) { .nav-links a:not(.nav-cta) { display: none; } }

  .breadcrumbs { max-width: 1100px; margin: 1.5rem auto 0; padding: 0 clamp(1.25rem, 4vw, 2.5rem); font-size: .85rem; color: var(--ink-faint); }
  .breadcrumbs a { color: var(--ink-faint); }
  .breadcrumbs a:hover { color: var(--maple); }

  .hero { padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem); display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(2rem, 5vw, 4rem); max-width: 1180px; margin: 0 auto; align-items: center; }
  @media (max-width: 800px) { .hero { grid-template-columns: 1fr; } }
  .hero-text .chapter-tag { font-family: var(--font-body); font-size: .8rem; font-weight: 500; letter-spacing: .15em; text-transform: uppercase; color: var(--maple); margin: 0 0 1rem; }
  .hero-text h1 { font-family: var(--font-display); font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 50; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1; letter-spacing: -.02em; margin: 0 0 .8rem; font-weight: 400; }
  .hero-text h1 em { font-style: italic; color: var(--maple); }
  .hero-text .age-script { font-family: var(--font-script); font-size: 2rem; color: var(--maple); margin: 0 0 1.5rem; }
  .hero-text .tagline { font-size: 1.15rem; color: var(--ink-soft); margin: 0; font-weight: 300; max-width: 30ch; }
  ${stage.featured ? `.hero-text .badge-2027 { display: inline-block; background: var(--maple); color: var(--paper); padding: .35rem .9rem; border-radius: 999px; font-size: .8rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; margin-top: 1rem; }` : ''}

  .hero-photo { aspect-ratio: 4/5; border-radius: 22px; background: linear-gradient(135deg, var(--stage-from), var(--stage-to)); box-shadow: var(--shadow); position: relative; overflow: hidden; }
  .hero-photo::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.25), transparent 60%), radial-gradient(circle at 70% 80%, rgba(0,0,0,.18), transparent 60%); }
  .hero-photo .label { position: absolute; bottom: 1.5rem; left: 1.5rem; right: 1.5rem; color: var(--paper); font-family: var(--font-script); font-size: 1.6rem; text-shadow: 0 2px 12px rgba(0,0,0,.4); z-index: 1; }

  main { max-width: 880px; margin: 0 auto; padding: clamp(2rem, 4vw, 3rem) clamp(1.25rem, 4vw, 2rem) 4rem; }
  section { margin-bottom: clamp(3rem, 5vw, 4rem); }
  section h2 { font-family: var(--font-display); font-variation-settings: "opsz" 144, "wght" 500, "SOFT" 40; font-size: clamp(1.7rem, 3vw, 2.4rem); color: var(--ink); margin: 0 0 .5rem; }
  section h2 em { font-style: italic; color: var(--maple); }
  section .lead { font-size: 1.15rem; color: var(--ink-soft); font-weight: 300; line-height: 1.6; margin: 0 0 1.5rem; max-width: 60ch; }

  .grid-2 { display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem 2rem; margin: 1.5rem 0; }
  .grid-2 dt { font-family: var(--font-display); font-weight: 500; color: var(--ink); font-size: 1.05rem; padding-top: .15rem; }
  .grid-2 dd { margin: 0; color: var(--ink-soft); font-weight: 300; border-bottom: 1px dashed var(--paper-shade); padding-bottom: 1rem; }
  .grid-2 > div { display: contents; }
  @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; gap: .5rem 0; } .grid-2 dd { margin-bottom: 1rem; } }

  details { background: var(--paper); border: 1px solid var(--paper-shade); border-radius: 14px; margin: .8rem 0; overflow: hidden; }
  details[open] { border-color: var(--maple-soft); }
  summary { cursor: pointer; font-family: var(--font-display); font-weight: 500; font-size: 1.05rem; padding: 1.1rem 1.4rem; color: var(--ink); list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: "+"; color: var(--maple); font-size: 1.5rem; font-weight: 300; flex-shrink: 0; }
  details[open] summary { background: var(--paper-deep); }
  details[open] summary::after { content: "−"; }
  details > p { padding: 1.1rem 1.4rem 1.3rem; color: var(--ink-soft); line-height: 1.65; font-weight: 300; margin: 0; }

  .cta-box { background: linear-gradient(135deg, var(--blush), var(--paper-deep)); border-radius: 22px; padding: clamp(2.5rem, 5vw, 3.5rem); text-align: center; margin: 4rem 0 1rem; box-shadow: var(--shadow-soft); }
  .cta-box h3 { font-family: var(--font-display); font-style: italic; font-size: clamp(1.5rem, 2.5vw, 2.2rem); color: var(--ink); margin: 0 0 .75rem; font-weight: 400; }
  .cta-box h3 em { color: var(--maple); }
  .cta-box p { color: var(--ink-soft); font-size: 1.05rem; margin: 0 0 1.5rem; }
  .btn { display: inline-flex; align-items: center; gap: .55rem; padding: 1rem 1.8rem; background: var(--maple); color: var(--paper); border-radius: 999px; font-weight: 600; font-size: 1rem; box-shadow: 0 12px 26px -10px rgba(200,16,46,.55); transition: transform .2s, background .2s; }
  .btn:hover { background: var(--maple-deep); color: var(--paper); transform: translateY(-2px); }

  .nav-stages { display: flex; gap: 1rem; justify-content: space-between; align-items: center; margin: 3rem 0 1rem; padding: 1.5rem; background: var(--paper-deep); border-radius: 14px; font-size: .92rem; }
  .nav-stages a { color: var(--ink-soft); font-weight: 500; }
  .nav-stages a:hover { color: var(--maple); }
  @media (max-width: 600px) { .nav-stages { flex-direction: column; text-align: center; gap: .5rem; } }

  .wa-float { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 60; width: 58px; height: 58px; border-radius: 50%; background: #25D366; color: #fff; display: grid; place-items: center; box-shadow: 0 10px 30px -8px rgba(37,211,102,.55); }
  .wa-float:hover { color: #fff; }

  .site-footer { background: var(--ink); color: var(--paper); padding: 2.5rem clamp(1.25rem, 4vw, 2.5rem); text-align: center; }
  .site-footer p { margin: .25rem 0; font-size: .9rem; color: rgba(251,247,240,.7); }
  .site-footer a { color: var(--maple-soft); }
</style>

<script src="/assets/consent.js" defer></script>
</head>
<body>

<header class="site-nav">
  <a href="/" class="brand" aria-label="Maple Bear Bento Gonçalves">
    <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#C8102E"/>
      <circle cx="32" cy="37" r="16" fill="#FBF7F0"/>
      <circle cx="20" cy="23" r="7" fill="#FBF7F0"/>
      <circle cx="44" cy="23" r="7" fill="#FBF7F0"/>
      <circle cx="20" cy="23" r="3" fill="#C8102E"/>
      <circle cx="44" cy="23" r="3" fill="#C8102E"/>
      <circle cx="26" cy="34" r="2" fill="#2A2522"/>
      <circle cx="38" cy="34" r="2" fill="#2A2522"/>
      <ellipse cx="32" cy="44" rx="5" ry="3.5" fill="#F4DBCB"/>
      <ellipse cx="32" cy="42" rx="1.8" ry="1.3" fill="#2A2522"/>
    </svg>
    <span class="brand-text">
      <span class="brand-line-1">Maple Bear</span>
      <span class="brand-line-2">Bento Gonçalves</span>
    </span>
  </a>
  <nav class="nav-links">
    <a href="/sobre/">Sobre</a>
    <a href="/estagios/">Estágios</a>
    <a href="/diario/">Diário</a>
    <a href="/faq/">FAQ</a>
    <a href="https://wa.me/${WA}?text=Ol%C3%A1!%20Tenho%20interesse%20no%20est%C3%A1gio%20${encodeURIComponent(fullName)}%20da%20Maple%20Bear%20Bento%20Gon%C3%A7alves." class="nav-cta" target="_blank" rel="noopener">Agendar visita</a>
  </nav>
</header>

<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Início</a> › <a href="/estagios/">Faixas etárias</a> › <span>${stage.name}</span>
</nav>

<section class="hero">
  <div class="hero-text">
    <p class="chapter-tag">${stage.n} · ${stage.name}${yearLabel}</p>
    <h1>${stage.tagline.replace(/(\b\w+\b)\.$/, '<em>$1</em>.')}</h1>
    <p class="age-script">${stage.range}</p>
    <p class="tagline">${stage.intro}</p>
    ${stage.featured ? `<p><span class="badge-2027">Novidade · ${stage.year}</span></p>` : ''}
  </div>
  <div class="hero-photo" aria-hidden="true">
    <span class="label">${stage.range} · ${stage.shortName || stage.name}</span>
  </div>
</section>

<main>

<section>
  <h2>Por que <em>${stage.name}</em>?</h2>
  <p class="lead">${stage.why}</p>
</section>

<section>
  <h2>O que <em>aprende</em>.</h2>
  <p class="lead">Currículo Maple Bear pra o estágio ${stage.name} — adaptado e detalhado em visita pessoal.</p>
  <dl class="grid-2">
    ${stage.curriculum.map(([area, desc]) => `<div><dt>${area}</dt><dd>${desc}</dd></div>`).join('')}
  </dl>
</section>

<section>
  <h2>Como é <em>o dia</em>.</h2>
  <p class="lead">Rotina típica do ${stage.name}. Tempos podem variar levemente conforme idade e turma.</p>
  <dl class="grid-2">
    ${stage.routine.map(([time, what]) => `<div><dt>${time}</dt><dd>${what}</dd></div>`).join('')}
  </dl>
</section>

<section>
  <h2>Perguntas <em>específicas</em>.</h2>
  ${stage.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('\n  ')}
</section>

<div class="cta-box">
  <h3>Visite o ${stage.name} <em>pessoalmente</em>.</h3>
  <p>Conheça a sala, a equipe e converse com nossa coordenação. Agende um horário sem compromisso.</p>
  <a href="https://wa.me/${WA}?text=Ol%C3%A1!%20Tenho%20interesse%20no%20${encodeURIComponent(fullName)}%20(${encodeURIComponent(stage.range)})%20e%20gostaria%20de%20agendar%20uma%20visita." class="btn" target="_blank" rel="noopener">📅 Agendar visita pelo WhatsApp</a>
</div>

<nav class="nav-stages" aria-label="Outros estágios">
  <a href="/estagios/">← Todos os estágios</a>
  <a href="/faq/">Perguntas frequentes →</a>
</nav>

</main>

<a class="wa-float" href="https://wa.me/${WA}?text=Ol%C3%A1!%20Tenho%20interesse%20na%20Maple%20Bear%20Bento%20Gon%C3%A7alves." target="_blank" rel="noopener" aria-label="WhatsApp">
  <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.7 2 6.7L4 29l7.5-2c1.9 1 4.1 1.6 6.5 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3zm5.6 15.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z"/></svg>
</a>

<footer class="site-footer">
  <p><strong>Maple Bear Bento Gonçalves</strong> — Em Bento desde 2025 · Year 1 em 2027</p>
  <p><a href="https://wa.me/${WA}">WhatsApp +55 54 9 9931-5480</a> · <a href="mailto:contato@maplebearbg.com.br">contato@maplebearbg.com.br</a></p>
  <p style="margin-top:.5rem"><a href="/sobre/">Sobre</a> · <a href="/diario/">Diário</a> · <a href="/faq/">FAQ</a> · <a href="/privacidade/">Privacidade</a> · <a href="/termos/">Termos</a></p>
</footer>

</body>
</html>
`;
}

// ─── Index page de todos os estágios ───
function renderIndex() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#C8102E">

<title>Faixas etárias · Maple Bear Bento Gonçalves</title>
<meta name="description" content="6 estágios da educação infantil ao 1º ano do Fundamental: Bear Care (18m), Toddler (2a), Nursery (3a), JK (4a), SK (5a), Year 1 (6-7a, 2027).">
<link rel="canonical" href="https://maplebearbg.com.br/estagios/">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Spectral:ital,wght@0,200..800;1,200..800&family=Caveat:wght@500;600&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">

<style>
  :root { --paper:#FBF7F0; --paper-deep:#F4ECDF; --paper-shade:#EBE0CC; --ink:#2A2522; --ink-soft:#5C544D; --ink-faint:#8A7F75; --maple:#C8102E; --maple-deep:#8B0A1F; --maple-soft:#E84A5F; --blush:#F4DBCB; --shadow-soft:0 14px 30px -18px rgba(42,37,34,.18); --shadow:0 30px 60px -25px rgba(42,37,34,.25); --font-display:'Fraunces',Georgia,serif; --font-body:'Spectral',Georgia,serif; --font-script:'Caveat',cursive; }
  *,*::before,*::after { box-sizing: border-box; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--font-body); font-size: 1.1rem; line-height: 1.7; -webkit-font-smoothing: antialiased; }
  a { color: var(--maple); text-decoration: none; transition: color .2s; }

  .site-nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; gap: 2rem; padding: 1.1rem clamp(1.25rem, 4vw, 2.5rem); background: rgba(251,247,240,0.92); backdrop-filter: blur(14px); border-bottom: 1px solid var(--paper-shade); }
  .brand { display: flex; align-items: center; gap: 0.7rem; color: var(--ink); }
  .brand-mark { width: 44px; height: 44px; flex-shrink: 0; filter: drop-shadow(0 4px 8px rgba(200,16,46,0.18)); }
  .brand-text { display: flex; flex-direction: column; line-height: 1.05; }
  .brand-line-1 { font-weight: 600; font-size: .78rem; letter-spacing: .1em; text-transform: uppercase; color: var(--maple); }
  .brand-line-2 { font-weight: 500; font-size: 1.15rem; font-style: italic; color: var(--ink); font-family: var(--font-display); margin-top: 1px; }
  .nav-links { display: flex; gap: 1.4rem; }
  .nav-links a { color: var(--ink-soft); font-size: .95rem; font-weight: 500; }
  .nav-cta { background: var(--maple); color: var(--paper) !important; padding: .6rem 1.1rem; border-radius: 999px; }
  @media (max-width: 640px) { .nav-links a:not(.nav-cta) { display: none; } }

  .hero { padding: clamp(3rem, 8vw, 6rem) clamp(1.25rem, 4vw, 2.5rem) clamp(2rem, 5vw, 4rem); text-align: center; background: linear-gradient(180deg, var(--paper) 0%, var(--paper-deep) 100%); }
  .eyebrow { display: inline-flex; align-items: center; gap: .6rem; margin: 0 0 1.5rem; font-size: .85rem; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-soft); }
  .eyebrow-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--maple); box-shadow: 0 0 0 4px rgba(200,16,46,0.18); }
  h1 { font-family: var(--font-display); font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 50; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1; letter-spacing: -.025em; margin: 0 0 1.5rem; font-weight: 400; }
  h1 em { font-style: italic; color: var(--maple); }
  .lead { max-width: 56ch; margin: 0 auto; font-size: clamp(1.1rem, 1.5vw, 1.3rem); color: var(--ink-soft); font-weight: 300; line-height: 1.55; }

  main { max-width: 1180px; margin: 0 auto; padding: clamp(2rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem); display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(1.5rem, 3vw, 2rem); }
  .stage-card { background: var(--paper); border: 1px solid var(--paper-shade); border-radius: 22px; overflow: hidden; transition: box-shadow .3s, transform .3s; color: inherit; display: flex; flex-direction: column; }
  .stage-card:hover { box-shadow: var(--shadow); transform: translateY(-4px); }
  .stage-card .photo { aspect-ratio: 5/4; position: relative; overflow: hidden; }
  .stage-card .photo::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.25), transparent 60%); }
  .stage-card .photo span { position: absolute; top: 1rem; left: 1rem; background: rgba(251,247,240,.95); color: var(--maple); padding: .35rem .8rem; border-radius: 999px; font-size: .72rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; z-index: 1; }
  .stage-card .body { padding: 1.75rem; display: flex; flex-direction: column; flex: 1; }
  .stage-card h2 { font-family: var(--font-display); font-size: 1.5rem; margin: 0 0 .25rem; color: var(--ink); font-weight: 500; }
  .stage-card .age { font-family: var(--font-script); font-size: 1.3rem; color: var(--maple); margin: 0 0 .75rem; }
  .stage-card p { color: var(--ink-soft); font-size: .98rem; line-height: 1.55; margin: 0 0 1rem; font-weight: 300; flex: 1; }
  .stage-card .more { color: var(--maple); font-weight: 500; font-size: .95rem; }
  .stage-card.featured { border-color: var(--maple); }
  .stage-card.featured .body { background: var(--paper-deep); }
  .badge { display: inline-block; background: var(--maple); color: var(--paper); padding: .2rem .6rem; border-radius: 999px; font-size: .7rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; margin-bottom: .5rem; }

  .site-footer { background: var(--ink); color: var(--paper); padding: 2.5rem clamp(1.25rem, 4vw, 2.5rem); text-align: center; }
  .site-footer p { margin: .25rem 0; font-size: .9rem; color: rgba(251,247,240,.7); }
  .site-footer a { color: var(--maple-soft); }
</style>

<script src="/assets/consent.js" defer></script>
</head>
<body>

<header class="site-nav">
  <a href="/" class="brand" aria-label="Maple Bear Bento Gonçalves">
    <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#C8102E"/>
      <circle cx="32" cy="37" r="16" fill="#FBF7F0"/>
      <circle cx="20" cy="23" r="7" fill="#FBF7F0"/>
      <circle cx="44" cy="23" r="7" fill="#FBF7F0"/>
      <circle cx="20" cy="23" r="3" fill="#C8102E"/>
      <circle cx="44" cy="23" r="3" fill="#C8102E"/>
      <circle cx="26" cy="34" r="2" fill="#2A2522"/>
      <circle cx="38" cy="34" r="2" fill="#2A2522"/>
      <ellipse cx="32" cy="44" rx="5" ry="3.5" fill="#F4DBCB"/>
      <ellipse cx="32" cy="42" rx="1.8" ry="1.3" fill="#2A2522"/>
    </svg>
    <span class="brand-text">
      <span class="brand-line-1">Maple Bear</span>
      <span class="brand-line-2">Bento Gonçalves</span>
    </span>
  </a>
  <nav class="nav-links">
    <a href="/sobre/">Sobre</a>
    <a href="/estagios/">Estágios</a>
    <a href="/diario/">Diário</a>
    <a href="/faq/">FAQ</a>
    <a href="https://wa.me/${WA}" class="nav-cta" target="_blank" rel="noopener">Agendar visita</a>
  </nav>
</header>

<section class="hero">
  <p class="eyebrow"><span class="eyebrow-dot"></span> Faixas etárias · 18 meses ao Year 1</p>
  <h1>Seis estágios <em>de uma infância</em>.</h1>
  <p class="lead">Do <em>Bear Care</em> (18 meses) ao <em>Senior Kindergarten</em> (5 anos) — em funcionamento desde 2025. Em 2027, abrimos o <em>Year 1</em>. Conheça cada estágio em detalhe.</p>
</section>

<main>
  ${STAGES.map(s => `
  <a href="/estagios/${s.slug}/" class="stage-card${s.featured ? ' featured' : ''}">
    <div class="photo" style="background: linear-gradient(135deg, ${s.color[0]}, ${s.color[1]});">
      <span>${s.n} · ${s.shortName || s.name}</span>
    </div>
    <div class="body">
      ${s.featured ? `<span class="badge">Novidade ${s.year}</span>` : ''}
      <h2>${s.name}</h2>
      <p class="age">${s.range}</p>
      <p>${s.intro.split('.')[0]}.</p>
      <span class="more">Conhecer este estágio →</span>
    </div>
  </a>`).join('')}
</main>

<footer class="site-footer">
  <p><strong>Maple Bear Bento Gonçalves</strong> — Em Bento desde 2025 · Year 1 em 2027</p>
  <p><a href="https://wa.me/${WA}">WhatsApp +55 54 9 9931-5480</a> · <a href="mailto:contato@maplebearbg.com.br">contato@maplebearbg.com.br</a></p>
  <p style="margin-top:.5rem"><a href="/sobre/">Sobre</a> · <a href="/diario/">Diário</a> · <a href="/faq/">FAQ</a> · <a href="/privacidade/">Privacidade</a> · <a href="/termos/">Termos</a></p>
</footer>

</body>
</html>
`;
}

// ─── Run ───
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), renderIndex(), 'utf8');
console.log('✓ /estagios/index.html');

for (const s of STAGES) {
  const dir = path.join(OUT, s.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), render(s), 'utf8');
  console.log(`✓ /estagios/${s.slug}/index.html`);
}

console.log('\n✅ 7 páginas geradas (index + 6 estágios).');
