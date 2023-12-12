import express from "express";

const app = express();
const port = 8000;

let jogadoresSkips = {
  1: [],
  2: [],
  3: [],
  4: [],
}

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

function weight(peso, possibilidades) {
  possibilidades.forEach((play, index) => {
    const weight = play.pedra.split("-").reduce((acc, cur) => acc + parseInt(cur), 0);
    possibilidades[index].peso += weight * peso;
  })

  return possibilidades;
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

  if (possibilidades.length === 0) {
    return {};
  }

  const estrategias = {
    "dupla": Number(process.env.DUPLA) ?? 3,
    "variedade": Number(process.env.ESTRATEGIA) ?? 1.5,
    "block": Number(process.env.BLOCK) ?? 1,
    "weight": Number(process.env.WEIGHT) ?? 0.1,
  }

  if (jogadas.length < 4) {
    jogadoresSkips = {
      1: [],
      2: [],
      3: [],
      4: [],
    }
  }

  const skips = checkSkip(jogadas);

  possibilidades = duplas(estrategias.dupla, possibilidades);
  possibilidades = variedade(estrategias.variedade, variedadeMao, possibilidades);
  possibilidades = block(estrategias.block, jogador, possibilidades, skips);
  possibilidades = weight(estrategias.weight, possibilidades);
  possibilidades.sort((a, b) => b.peso - a.peso);

  return possibilidades[0];
}

app.use(express.json());

app.post('/', (req, res) => {
  const json = req.body;

  const jogada = decidirJogadaV2({ mao: json.mao, mesa: json.mesa, jogador: json.jogador, jogadas: json.jogadas });
  res.json(jogada);
});

app.listen(port, () => {
  console.log(`Tutu - Listening on port ${port}`)
});