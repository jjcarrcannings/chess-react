import Square from "./square";
import '../styles/board.css'

const rowStyle = {
    height: '12.5%',
    width: '12.5%'
}

const boardStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '20',
	width: '100%',
	height: '100%'
}

function Board({squares, selectedSquare=[], availableDestinations, onClick}){
    let renderSquare = ({isWhite, piece, pos}) => {
        return <div style={rowStyle}>
                <Square
                    isWhite={isWhite}
                    piece={piece}
                    isSelected={selectedSquare.toString()==pos.toString()}
                    onClick={() => onClick(pos)}
                    isValidDestination={availableDestinations.some(e=>e.toString()==pos.toString())}
                />
               </div>
    };
    let renderSquares = (squares) => {
        const squareGrid = [];
        let isWhite = false;
        for (let i=0; i<8; i++) {
            isWhite = !isWhite;
            for (let j=0; j<8; j++) {
                squareGrid.push(renderSquare({isWhite:isWhite,piece:squares[i][j], pos:[i,j]}));
                isWhite = !isWhite;
            }
        }
        return squareGrid;
    };
    return (
        <div className="Board" style={boardStyle}>
            {renderSquares(squares)}
        </div>
        
    );
}

export default Board;