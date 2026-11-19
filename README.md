# A porta e a escada da sua oferta · skill grátis para o Claude

Você já vende serviço, mentoria ou curso. Falta uma porta de entrada barata, para quem ainda não confia em você o bastante para comprar o produto principal.

Esta skill te entrevista e monta as duas peças que fazem um produto de entrada virar negócio:

- **A porta:** um PDF barato e rápido, que ajuda o seu cliente a dar um passo só. Ela escreve o PDF inteiro e entrega o arquivo pronto.
- **A escada:** o primeiro upgrade, um pacote numa oferta única logo depois da compra, que o cliente não encontra em outro lugar.

E ainda te entrega o plano para divulgar a porta todo dia.

## O que você recebe

Uma pasta `porta-e-escada/` com:

| Arquivo | O que tem |
|---|---|
| `porta.pdf` | O PDF inteiro, com capa, de 5 a 7 capítulos que terminam numa ação, e a página do próximo degrau |
| `porta.md` | O mesmo texto, para você editar |
| `escada.md` | O upgrade: nome, o que vem dentro, preço com âncora e o texto da página da oferta única. E o segundo degrau |
| `divulgacao.md` | 7 dias, 3 posts por dia: formato, gancho e chamada |
| `resumo.md` | Uma tela: preço da porta, preço do upgrade e o primeiro post para hoje |

Ela trabalha por partes: mostra o passo escolhido, os títulos, o sumário, e só escreve o PDF depois da sua aprovação. Não inventa prova: depoimento ou número que você não informou vira um marcador amarelo no PDF para você preencher.

Veja um exemplo em [`exemplos/confeitaria/`](exemplos/confeitaria/), com o PDF gerado.

## Instalação

**No Claude Code**

Baixe este repositório e copie a pasta para a pasta de skills do Claude com o nome `porta-e-escada`:

- Windows: `%USERPROFILE%\.claude\skills\porta-e-escada`
- Mac e Linux: `~/.claude/skills/porta-e-escada`

O PDF é gerado pelo `scripts/montar-pdf.js`, que usa o Node e o Chrome ou o Edge que você já tem. Sem internet e sem instalar nada. Se não achar o navegador, ele gera um HTML que você abre e salva como PDF.

**No claude.ai e em outras IAs**

Compacte a pasta num `.zip` e envie na área de Skills (claude.ai), ou cole o `SKILL.md` e os arquivos de `references/` como instrução. Nesses casos você recebe o texto e salva o PDF por conta própria.

## Como usar

Peça do jeito que você falaria:

- "Quero um produto de entrada barato para a minha mentoria"
- "Monta um PDF para eu vender a R$ 27"
- "Qual upsell eu ofereço depois da compra do ebook?"

## O que ela não faz

Não cria a página de venda da porta, não configura o checkout nem a oferta única na plataforma e não publica os posts.

## Versão completa

A skill desenha a porta e a escada. A versão completa coloca a escada de pé: eu construo o app de IA do upgrade, aquele que faz parte do trabalho pelo seu cliente, e um app de conteúdo que guarda o seu acervo e te ajuda a manter a divulgação da porta todo dia.

Fale comigo no direct: [@copywriterdesantana](https://ig.me/m/copywriterdesantana).

## Licença

MIT. Pode usar, adaptar e distribuir, inclusive em projetos comerciais. Veja [`LICENSE`](LICENSE).

Feito por [@copywriterdesantana](https://instagram.com/copywriterdesantana).
