import express from "express";

const app = express();
const port = 8000;

// ESTRATÉGIAS
function duplas(peso, possibilidades) {
  possibilidades.forEach((play, index) => {
    if (play.pedra[0] === play.pedra[2]) {
      possibilidades[index].peso += 1 * peso;
    }
  })

  return possibilidades;
}

function variedade(peso, variedade, possibilidades) {
  possibilidades.forEach((play, index) => {
    let valor = 0

    valor += variedade[play.pedra[0]] + variedade[play.pedra[2]];
    valor *= peso;

    possibilidades[index].peso += valor;
  })

  return possibilidades;
}

const jogadoresSkips = {
  1: [],
  2: [],
  3: [],
  4: [],
}

// const jogadas = [
//   { jogador: 4, pedra: '6-6' },
//   { jogador: 1, pedra: '6-0', lado: 'direita' },
//   { jogador: 2, pedra: '0-1', lado: 'direita' },
//   { jogador: 3, pedra: '1-3', lado: 'direita' },
//   { jogador: 4, pedra: '4-6', lado: 'esquerda' }, //check skips - none
//   { jogador: 1, pedra: '3-3', lado: 'direita' },
//   { jogador: 2, pedra: '3-4', lado: 'direita' },
//   { jogador: 3, pedra: '5-4', lado: 'esquerda' },
//   { jogador: 4, pedra: '0-5', lado: 'esquerda' }, //check skips - none
//   { jogador: 1, pedra: '4-4', lado: 'direita' },
//   { jogador: 2, pedra: '4-1', lado: 'direita' },
//   { jogador: 4, pedra: '0-0', lado: 'esquerda' }, //check skips - player 3 (0, 1)
// ]

// const currentToPlayer = jogadas.slice(0, jogadas.findLastIndex(jogada => jogada.jogador === 2) + 1);

// const lastTwoEsquerda = currentToPlayer.filter(jogada => jogada.lado === "esquerda").slice(-2);
// const lastTwoDireita = currentToPlayer.filter(jogada => jogada.lado === "direita").slice(-2);

// const a = [...lastTwoEsquerda[1].pedra].filter(n => !lastTwoEsquerda[0].pedra.includes(n))[0] ?? lastTwoEsquerda[1].pedra[0];
// const b = [...lastTwoDireita[1].pedra].filter(n => !lastTwoDireita[0].pedra.includes(n))[0] ?? lastTwoDireita[1].pedra[0];

function checkSkip(jogadas) {
  const lastJogadas = jogadas.slice(-4);
  const playersSkips = [1, 2, 3, 4].filter(jogador => !lastJogadas.map(play => play.jogador).includes(jogador));

  playersSkips.forEach(jogador => {
    const mesaToPlayer = jogadas.slice(0, jogadas.findLastIndex(jogada => jogada.jogador === jogador - 1) + 1)

    const findLeft = mesaToPlayer.filter(jogada => jogada.lado !== "direita").slice(-2);
    const findRight = mesaToPlayer.filter(jogada => jogada.lado !== "esquerda").slice(-2);

    if (findLeft.length) {
      let skipLeft = 0;

      if (findLeft.length === 1) {
        skipLeft = findLeft[0].pedra[0];
      } else {
        skipLeft = [...findLeft[1]?.pedra].filter(n => !findLeft[0].pedra.includes(n))[0] ?? findLeft[1].pedra[0];
      }



      jogadoresSkips[jogador].push(skipLeft);
    }

    if (findRight.length) {
      let skipRight = 0;

      if (findRight.length === 1) {
        skipRight = findRight[0].pedra[0];
      } else {
        skipRight = [...findRight[1]?.pedra].filter(n => !findRight[0].pedra.includes(n))[0] ?? findRight[1].pedra[0];
      }


      jogadoresSkips[jogador].push(skipRight);
    }
  })

  return jogadoresSkips;
}

function block(peso, jogador, possibilidades, skips) {
  const nextPlayer = jogador + 1 > 4 ? 1 : jogador + 1;
  possibilidades.forEach((play, index) => {
    if (skips[nextPlayer].some(skip => play.pedra.includes(skip))) {
      possibilidades[index].peso += 1 * peso;
    }
  })

  return possibilidades;
}

let p = [
  { pedra: '1-2', lado: 'esquerda', peso: 0 },
  { pedra: '0-4', lado: 'direita', peso: 0 },
  { pedra: '1-6', lado: 'esquerda', peso: 0 },
  { pedra: '4-4', lado: 'direita', peso: 0 }
];

function weight(peso, possibilidades) {
  possibilidades.forEach((play, index) => {
    const weight = play.pedra.split("-").reduce((acc, cur) => acc + parseInt(cur), 0);
    possibilidades[index].peso += weight * peso;
  })

  return possibilidades;
}

// {
//   jogador: 4,
//   mao: [ '0-3' ],
//   mesa: [
//     '5-3', '3-6', '6-1', '1-2',
//     '2-0', '0-0', '0-5', '5-4',
//     '4-6', '6-6', '6-0', '0-1',
//     '1-3', '3-3', '3-4', '4-4',
//     '4-1', '1-1', '1-5', '5-5',
//     '5-2', '2-4', '4-0'
//   ],
//   jogadas: [
//     { jogador: 4, pedra: '6-6' },
//     { jogador: 1, pedra: '6-0', lado: 'direita' },
//     { jogador: 2, pedra: '0-1', lado: 'direita' },
//     { jogador: 3, pedra: '1-3', lado: 'direita' },
//     { jogador: 4, pedra: '4-6', lado: 'esquerda' }, //check skips - none
//     { jogador: 1, pedra: '3-3', lado: 'direita' },
//     { jogador: 2, pedra: '3-4', lado: 'direita' },
//     { jogador: 3, pedra: '5-4', lado: 'esquerda' },
//     { jogador: 4, pedra: '0-5', lado: 'esquerda' }, //check skips - none
//     { jogador: 1, pedra: '4-4', lado: 'direita' },
//     { jogador: 2, pedra: '4-1', lado: 'direita' },
//     { jogador: 4, pedra: '0-0', lado: 'esquerda' }, //check skips - player 3 (0, 1)
//     { jogador: 1, pedra: '1-1', lado: 'direita' },
//     { jogador: 2, pedra: '1-5', lado: 'direita' },
//     { jogador: 3, pedra: '5-5', lado: 'direita' },
//     { jogador: 4, pedra: '2-0', lado: 'esquerda' }, //check skips
//     { jogador: 1, pedra: '1-2', lado: 'esquerda' },
//     { jogador: 2, pedra: '5-2', lado: 'direita' },
//     { jogador: 3, pedra: '2-4', lado: 'direita' },
//     { jogador: 4, pedra: '4-0', lado: 'direita' }, //check skips
//     { jogador: 1, pedra: '6-1', lado: 'esquerda' },
//     { jogador: 2, pedra: '3-6', lado: 'esquerda' },
//     { jogador: 3, pedra: '5-3', lado: 'esquerda' }
//   ]
// }

// let p = [
//   { pedra: '1-2', lado: 'esquerda', peso: 0 },
//   { pedra: '0-4', lado: 'direita', peso: 0 },
//   { pedra: '1-6', lado: 'esquerda', peso: 0 },
//   { pedra: '4-4', lado: 'direita', peso: 0 }
// ];
// const v = { '0': 2, '1': 2, '2': 1, '3': 1, '4': 2, '5': 1, '6': 2 };
// p = duplas(1, p);
// console.log(variedade(2, v, p));


// JOGADAS
function decidirJogadaV0(possibilidades) {
  return possibilidades[Math.floor(Math.random() * possibilidades.length)]
}

function decidirJogadaV1(possibilidades) {
  var regex = /^(.).*\1$/;

  const index = possibilidades.findIndex(play => regex.test(play.pedra))
  return possibilidades[index >= 0 ? index : Math.floor(Math.random() * possibilidades.length)]
}

function decidirJogadaV2({ mao, mesa, jogador, jogadas }) {
  const variedadeMao = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let possibilidades = [];
  for (const pedra of mao) {
    if (pedra.split("-").includes(mesa[mesa.length - 1][2])) {
      possibilidades.push({ pedra, lado: "direita", peso: 0 });
    }
    if (pedra.split("-").includes(mesa[0][0])) {
      possibilidades.push({ pedra, lado: "esquerda", peso: 0 });
    }
    variedadeMao[pedra[0]]++;
    if (pedra[0] !== pedra[2]) {
      variedadeMao[pedra[2]]++;
    }
  }

  const estrategias = {
    "dupla": 1,
    "variedade": 2,
    "block": 1,
    "weight": 2,
  }

  const jogadoresSkips = checkSkip(jogadas);

  // console.log("mão:", mao)
  // console.log("variedade mão:", variedadeMao);
  // console.log("possibilidades:", possibilidades);

  console.log("Possibilidades Inicial:", possibilidades);
  possibilidades = duplas(estrategias.dupla, possibilidades);
  console.log("Possibilidades Duplas:", possibilidades);
  possibilidades = variedade(estrategias.variedade, variedadeMao, possibilidades);
  console.log("Possibilidades Variedade:", possibilidades);
  possibilidades = block(estrategias.block, jogador, possibilidades, jogadoresSkips);
  console.log("Possibilidades Block:", possibilidades);
  possibilidades = weight(estrategias.weight, possibilidades);
  console.log("Possibilidades Weight:", possibilidades);
  possibilidades.sort((a, b) => b.peso - a.peso);

  return possibilidades[0];
}

function test() {
  // const example = {
  //   "jogador": 3,
  //   "mao": ["3-6", "5-5", "1-2", "0-0", "0-4", "4-6", "4-4"],
  //   "mesa": ["1-6", "6-6", "6-4", "4-4"],
  //   "jogadas": [
  //     { "jogador": 3, "pedra": "6-6" },
  //     // { "jogador": 4, "pedra": "6-4", "lado": "direita" },
  //     { "jogador": 1, "pedra": "4-4", "lado": "direita" },
  //     { "jogador": 2, "pedra": "1-6", "lado": "esquerda" },
  //   ]
  // };

  // const example = {
  //   "jogador": 1,
  //   "mao": ["0-1", "1-2", "1-1", "4-4", "3-3", "1-6", "0-6"],
  //   "mesa": ["6-6"],
  //   "jogadas": [
  //     { "jogador": 4, "pedra": "6-6" },
  //     // { "jogador": 4, "pedra": "6-4", "lado": "direita" },
  //     // { "jogador": 1, "pedra": "4-4", "lado": "direita" },
  //     // { "jogador": 2, "pedra": "1-6", "lado": "esquerda" },
  //   ]
  // };

  const example = {
    jogador: 4,
    mao: ['0-3',
      '0-0',
      '2-0',
      '4-0'],
    mesa: [
      // '5-3', '3-6', '6-1', '1-2',
      // '2-0', '0-0', 
      '0-5',
      '5-4',
      '4-6', '6-6', '6-0', '0-1',
      '1-3', '3-3', '3-4',
      '4-4',
      '4-1',
      // '1-1', '1-5', '5-5',
      // '5-2', '2-4', '4-0'
    ],
    jogadas: [
      { jogador: 4, pedra: '6-6' },
      { jogador: 1, pedra: '6-0', lado: 'direita' },
      { jogador: 2, pedra: '0-1', lado: 'direita' },
      { jogador: 3, pedra: '1-3', lado: 'direita' },
      { jogador: 4, pedra: '4-6', lado: 'esquerda' }, //check skips - none
      { jogador: 1, pedra: '3-3', lado: 'direita' },
      { jogador: 2, pedra: '3-4', lado: 'direita' },
      { jogador: 3, pedra: '5-4', lado: 'esquerda' },
      { jogador: 4, pedra: '0-5', lado: 'esquerda' }, //check skips - none
      { jogador: 1, pedra: '4-4', lado: 'direita' },
      { jogador: 2, pedra: '4-1', lado: 'direita' },
      // { jogador: 4, pedra: '0-0', lado: 'esquerda' }, //check skips - player 3 (0, 1)
      // { jogador: 1, pedra: '1-1', lado: 'direita' },
      // { jogador: 2, pedra: '1-5', lado: 'direita' },
      // { jogador: 3, pedra: '5-5', lado: 'direita' },
      // { jogador: 4, pedra: '2-0', lado: 'esquerda' }, //check skips
      // { jogador: 1, pedra: '1-2', lado: 'esquerda' },
      // { jogador: 2, pedra: '5-2', lado: 'direita' },
      // { jogador: 3, pedra: '2-4', lado: 'direita' },
      // { jogador: 4, pedra: '4-0', lado: 'direita' }, //check skips
      // { jogador: 1, pedra: '6-1', lado: 'esquerda' },
      // { jogador: 2, pedra: '3-6', lado: 'esquerda' },
      // { jogador: 3, pedra: '5-3', lado: 'esquerda' }
    ]
  }

  const possibilidades = [];
  for (const pedra of example.mao) {
    if (pedra.split("-").includes(example.mesa[example.mesa.length - 1][2])) {
      possibilidades.push({ pedra, lado: "direita" });
    }
    if (pedra.split("-").includes(example.mesa[0][0])) {
      possibilidades.push({ pedra, lado: "esquerda" });
    }
  }

  console.log("jogada V0:", decidirJogadaV0(possibilidades));
  console.log("jogada V1:", decidirJogadaV1(possibilidades));
  console.log("jogada V2:", decidirJogadaV2({ mao: example.mao, mesa: example.mesa, jogador: example.jogador, jogadas: example.jogadas }));
}

app.use(express.json());

app.post('/', (req, res) => {
  const json = req.body;

  console.log("");
  console.log("json:", json);

  const possibilidades = [];
  for (const pedra of json.mao) {
    if (pedra.split("-").includes(json.mesa[json.mesa.length - 1][2])) {
      possibilidades.push({ pedra, lado: "direita" });
    }
    if (pedra.split("-").includes(json.mesa[0][0])) {
      possibilidades.push({ pedra, lado: "esquerda" });
    }
  }

  console.log("possibilidades:", possibilidades)

  if (possibilidades.length === 0) {
    res.json({});
    console.log("passo.")
  } else {
    const jogada = decidirJogadaV2({ mao: json.mao, mesa: json.mesa, jogador: json.jogador, jogadas: json.jogadas });

    console.log("jogada:", jogada)
    res.json(jogada);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

// test();