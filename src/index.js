import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={`square${i}`}
        value={this.props.squares[i]}
        onClick={() => {this.props.onClick(i)}}
      />
    );
  }

  render() {
    const rows = []
    for (let row = 0; row <= Math.sqrt(this.props.squares.length) - 1; row++) {
      const cols = []
      for (let col = 0; col <= Math.sqrt(this.props.squares.length) - 1; col++) {
        cols.push(this.renderSquare((row * 3) + col))
      }
      rows.push(
        <div key={`row${row}`} className="board-row">
          {cols}
        </div>
      )
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      let desc = `Go to game start`
      if (move) {
        for (let i = 0; i <= 8; ++i) {
          if (history[move - 1].squares[i] !== history[move].squares[i]) {
            desc = `Go to move #${move} (${Math.floor(i / 3) + 1}, ${(i % 3) + 1})`
            break
          }
        }
      }

      if (this.state.stepNumber === move) {
        desc = (<strong>{desc}</strong>)
      }

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {desc}
          </button>
        </li>
      )
    })

    let status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    if (winner) {
      status = `Winner: ${winner}`
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
