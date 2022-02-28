import * as React from "react"
import * as ReactDOM from "react-dom"
import "./index.css"

function Square({ highlighted, onClick, value }: {highlighted: boolean, onClick: () => void, value: string}) {
  return <button className={`square ${highlighted ? "highlight" : ""}`} onClick={onClick}>{value}</button>
}

function Board({ squares, handleClick }: { squares: string[], handleClick: (_i: number) => void }) {
  const renderSquare = (i: number) => {
    const winner = calculateWinner(squares)

    return (
      <Square
        key={`square${i}`}
        value={squares[i]}
        highlighted={winner ? winner.indexOf(i) > -1 : false}
        onClick={() => handleClick(i)}
      />
    )
  }

  const rows: JSX.Element[] = []
  for (let row = 0; row <= Math.sqrt(squares.length) - 1; row += 1) {
    const cols: JSX.Element[] = []
    for (let col = 0; col <= Math.sqrt(squares.length) - 1; col += 1) {
      cols.push(renderSquare((row * 3) + col))
    }
    rows.push(
      <div key={`row${row}`} className="board-row">
        {cols}
      </div>
    )
  }

  return <div>{rows}</div>
}

interface GameState {
  stepNumber: number,
  history: { squares: string[] }[],
  xIsNext: boolean,
  showHistoryAscending: boolean
}
class Game extends React.Component<{}, GameState> {
  state: GameState = {
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
    this.setState((state, _props) => ({
      history: history.concat([{ squares }]),
      stepNumber: history.length,
      xIsNext: !state.xIsNext
    }))
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  toggleSort() {
    this.setState((state, _props) => ({
      showHistoryAscending: !state.showHistoryAscending
    }))
  }

  render() {
    const { history } = this.state
    const current = history[this.state.stepNumber]
    const winner = calculateWinner(current.squares)

    const moves = history.map((step_, move) => {
      let descText = "Go to game start"
      if (move) {
        for (let i = 0; i <= 8; i += 1) {
          if (history[move - 1].squares[i] !== history[move].squares[i]) {
            descText = `Go to move #${move} (${Math.floor(i / 3) + 1}, ${(i % 3) + 1})`
            break
          }
        }
      }

      return (
        // eslint-disable-next-line react/no-array-index-key
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {this.state.stepNumber === move ? (<strong>{descText}</strong>) : descText}
          </button>
        </li>
      )
    })

    const sortedMoves = this.state.showHistoryAscending ? moves : moves.reverse()

    let status = `Next player: ${this.state.xIsNext ? "X" : "O"}`
    if (winner)
      status = `Winner: ${current.squares[winner[0]]}`
    if (this.state.stepNumber === 9)
      status = "You both lost"

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            handleClick={(i: number) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button type="button" onClick={() => this.toggleSort()}>
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
  document.getElementById("root")
)

function calculateWinner(squares: string[]): number[] | null {
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
  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i]
    }
  }
  return null
}
