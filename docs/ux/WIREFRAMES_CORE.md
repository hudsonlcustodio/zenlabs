# WIREFRAMES CORE — ZENLABS

Wireframes são funcionais, não high-fidelity.

## Operação

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Operação                                            Hoje ▾   Filtros ▾   │
│ Fábrica de produção                                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ 1.284              96,1%              3,9%              7                │
│ Ativas             STP                 Exceções          SLA              │
├──────────────────────────────────────────────────────────────────────────┤
│ ATENÇÃO                                                           39     │
│ ● CRIT  Identity Risk      Alpha / Training #928      21m   [Revisar]   │
│ ● HIGH  Budget Hold        Beta / Masterclass #183    42m   [Resolver]  │
│ ● HIGH  Provider outage    14 jobs elegíveis          —     [Ver]       │
├──────────────────────────────────────────────────────────────────────────┤
│ Produção      Gerando 416   QC 183   Assembly 71   Espera 561            │
└──────────────────────────────────────────────────────────────────────────┘
```

## Nova Produção

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Nova produção                                                       │
│ Demanda ───────── Análise ───────── Produção ───────── Resultado     │
├──────────────────────────────────────────────────────────────────────┤
│ Cliente        [ Alpha Corp                                      ▾ ]│
│ Digital Twin   [ João Silva                                      ▾ ]│
│                                                                      │
│ Objetivo                                                              │
│ [Autoridade] [Treinamento] [Curso] [Masterclass] [VSL] [Outro]       │
│                                                                      │
│ Roteiro / material                                                    │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ Cole o roteiro ou solte PDF, DOCX, TXT                           │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ Qualidade    (•) Recomendar  ( ) Econômica  ( ) Equilibrada          │
│                                                                      │
│                                                     [ Analisar ]      │
└──────────────────────────────────────────────────────────────────────┘
```

## Analysis / Pack

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Análise da produção                                      42m18s         │
│ Training · 7 capítulos · Complexidade média                              │
├───────────────────────────────┬─────────────────────────────────────────┤
│ Composição                    │ ✦ Recomendação                           │
│ Presenter         68%         │ DYNAMIC                                  │
│ Slides/Graphics   17%         │ Equilíbrio entre presença, visual e custo│
│ B-roll            10%         │                                          │
│ Motion             5%         │ Estimativa  R$ ___ – ___                 │
│                               │                    [Usar recomendação]    │
├───────────────────────────────┴─────────────────────────────────────────┤
│ Comparar packs:  Econômico      Dynamic       Premium                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Production Monitor

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Training #928                         GERANDO 62%        [•••]           │
│ 42m18s · 61 shots · Dynamic V3                                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Aceitos 38   Gerando 7   QC 3   Espera 13     Budget R$___ / R$___      │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Cap. 01  Introdução                                  04:18             │
│ ✓ Cap. 02  Fundamentos                                 06:43             │
│ ● Cap. 03  Aplicação                                   08:12             │
│    ✓ Shot 23  Presenter        00:28                                      │
│    ✓ Shot 24  Graphic          00:12                                      │
│    ● Shot 25  Presenter        00:41   Gerando                            │
│    ⚠ Shot 26  B-roll           00:09   QC                                 │
│ ○ Cap. 04  Exemplos                                     07:10             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Exception Queue

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Exceções                                                     39 abertas │
│ Critical 5   High 11   Medium 18   Low 5                                │
├──────────────────────────────────────────────────────────────────────────┤
│ Tipo ▾      Cliente ▾      SLA ▾                     Buscar...            │
├──────────────────────────────────────────────────────────────────────────┤
│ ● CRIT  Identity Risk   Alpha   #928 / Shot 17   21m     [Revisar]      │
│ ● HIGH  Budget Hold     Beta    #183             42m     [Resolver]     │
│ ● HIGH  Lip Sync        Gama    #711 / Shot 09   58m     [Reprocessar]  │
│ ● MED   QC Confidence   Delta   #522 / Shot 31   1h22    [Revisar]      │
└──────────────────────────────────────────────────────────────────────────┘
```

## Clients

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Clientes                                            [ + Novo cliente ] │
├────────────────────────────────────────────────────────────────────────┤
│ Buscar...                    Status ▾          Supervisor ▾             │
├────────────────────────────────────────────────────────────────────────┤
│ Cliente          Twin         Produção     Status       Supervisor      │
│ Alpha Corp       João         4 ativas     ● Normal     Lucas           │
│ Beta Academy     Maria        2 ativas     ● Normal     Ana             │
│ Gamma            —            —            ○ Setup      Lucas           │
│ Delta            Pedro        3 ativas     ⚠ Atenção    João            │
└────────────────────────────────────────────────────────────────────────┘
```

## Digital Twin

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [portrait] João Silva                                      ● ACTIVE    │
│            Digital Twin · IdentityPack v7                              │
├────────────────────────────────────────────────────────────────────────┤
│ Overview | Identity | Voice | Knowledge | Brand | Policies | History  │
├────────────────────────────────────────────────────────────────────────┤
│ IdentityPack v7                                           ACTIVE        │
│                                                                        │
│ [Front] [¾ Left] [¾ Right] [Left] [Right] [Full Body]                 │
│                                                                        │
│ Identity fidelity  96        Motion 92        Consistency 97           │
│ Last calibration   27 Aug 2026                                        │
└────────────────────────────────────────────────────────────────────────┘
```
