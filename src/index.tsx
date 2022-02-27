import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './index.css'

const Square: React.FC<React.ComponentProps<"button">> = (props) => {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component<React.ComponentProps<"div"> & { squares: string[] }> {
  renderSquare(i: number) {
    return (
      <Square
        key={`square${i}`}
        value={this.props.squares[i]}
        onClick={() => { this.props.onClick!(i as any) }}    // TODO: 'as any' is hacky
      />
    )
  }

  render() {
    const rows: JSX.Element[] = []
    for (let row = 0; row <= Math.sqrt(this.props.squares.length) - 1; row++) {
      const cols: JSX.Element[] = []
      for (let col = 0; col <= Math.sqrt(this.props.squares.length) - 1; col++) {
        cols.push(this.renderSquare((row * 3) + col))
      }
      rows.push(
        <div key={`row${row}`} className="board-row">
          {cols}
        </div>
      )
    }

    return (<div>{rows}</div>)
  }
}

interface GameState {
  stepNumber: number,
  history: { squares: string[] }[],
  xIsNext: boolean,
  showHistoryAscending: boolean
}
class Game extends React.Component<{}, GameState> {
  state = {
    stepNumber: 0,
    history: [{ squares: Array(9).fill(null) as string[] }],
    xIsNext: true,
    showHistoryAscending: true
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1)
    const current = history[history.length - 1]
    const squares = current.squares.slice()

    if (calculateWinner(squares) || squares[i]) {
      return
    }
    squares[i] = this.state.xIsNext ? "X" : "O"
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    })
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  render() {
    const history = this.state.history
    const current = history[this.state.stepNumber]
    const winner = calculateWinner(current.squares)

    const moves = history.map((step, move) => {
      let descText = "Go to game start"
      if (move) {
        for (let i = 0; i <= 8; ++i) {
          if (history[move - 1].squares[i] !== history[move].squares[i]) {
            descText = `Go to move #${move} (${Math.floor(i / 3) + 1}, ${(i % 3) + 1})`
            break
          }
        }
      }

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {this.state.stepNumber === move ? (<strong>{descText}</strong>) : descText}
          </button>
        </li>
      )
    })

    const sortedMoves = this.state.showHistoryAscending ? moves : moves.reverse()

    let status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`
    if (winner) {
      status = `Winner: ${winner}`
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i as any)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => { this.setState({ showHistoryAscending: !this.state.showHistoryAscending }) }}>
            Change sort to {this.state.showHistoryAscending ? "descending" : "ascending"}
          </button>
          <ol>{sortedMoves}</ol>
        </div>
      </div>
    )
  }
}

// ========================================

ReactDOM.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
)

function calculateWinner(squares: string[]): string | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}
