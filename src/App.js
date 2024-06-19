import logo from './logo.svg';
import './App.css';
import Board from './components/board'
import { useState } from 'react';
import { PIECES } from './constants/pieces';
import { cloneDeep } from 'lodash';

const appStyle = {
  height: '49vw',
  width: '49vw',
  justifyContent: 'center'
}

function App() {

  // Initial State
  let initialSquares = [
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖'],
  ];

  // State variables
  const [currentSquares, setSquares] = useState(initialSquares);
  const [pieceSelected, setPieceSelected] = useState([]);
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [isQueenCastleValidWhite, setIsQueenCastleValidWhite] = useState(true);
  const [isKingCastleValidWhite, setIsKingCastleValidWhite] = useState(true);
  const [isQueenCastleValidBlack, setIsQueenCastleValidBlack] = useState(true);
  const [isKingCastleValidBlack, setIsKingCastleValidBlack] = useState(true);
  const [mostRecentMove, setMostRecentMove] = useState([]);

  let handleClick = pos => {
    const squareClicked = currentSquares[pos[0]][pos[1]];
    if(squareClicked && isPieceWhite(squareClicked)==isWhiteTurn){ // Click is on active player's colour
        setPieceSelected(pos);
        setAvailableDestinations(calculateAvailableDestinations(pos));
    } else if(availableDestinations.some(e=>e.toString()==pos.toString())){ // Click corresponds to valid move destination
      const newSquares = executeMove(pieceSelected, pos);
      setSquares(newSquares);
      setMostRecentMove([pieceSelected, pos]);
      updateCastleConditions(pos);
      endTurn();
    } else{ // Invalid click
      setPieceSelected([]);
      setAvailableDestinations([]);
    }
    return;
  };

  let calculateAvailableDestinations = (pos, squares=currentSquares) => {
    const piece = squares[pos[0]][pos[1]];
    return pieceConfig[piece].getValidDestinations(pos,isPieceWhite(piece), squares)
                             .filter((move) => !isKingInCheckIfMove(pos, move, isPieceWhite(piece), squares));

  }

  let getValidPawnDestinations = (pos, isWhite, squares=currentSquares) => {
    const direction = isWhite ? -1 : 1;
    const validMoves = [
                                ...[[direction,-1],[direction,1]]
                                .map((e,i) => e.map((x,j) => x + pos[j]))
                                .filter((move) => isOnBoard(move)
                                                  && isSquareOccupiedOppositeColour(move,isWhite, squares)),
                                ...[[direction,0].map((e,i) => e + pos[i])]
                                .filter((move) => isOnBoard(move)
                                                  && isSquareEmpty(move, squares)),
                                ...(((isWhite && pos[0]==6) || (!isWhite && pos[0]==1)) 
                                      ? [[direction*2,0].map((e,i) => e + pos[i])]
                                        .filter((move) => isSquareEmpty([direction,0].map((e,i)=>e+pos[i]), squares)
                                                          && isSquareEmpty(move, squares)) 
                                      : [])
                              ];
    if(isEnPassantAvailableLeft(pos,isWhite,squares)){
      validMoves.push([pos[0]+direction,pos[1]-1]);
    }
    if(isEnPassantAvailableRight(pos,isWhite,squares)){
      validMoves.push([pos[0]+direction,pos[1]+1]);
    }
    return validMoves;
  }

  let getValidRookDestinations = (pos, isWhite, squares=currentSquares) => {  
    let validMoves = [];
    for(let moveDirection of [[-1,0],[0,-1],[1,0],[0,1]]){
      let currentMove = moveDirection.map((e,i)=>e+pos[i]);
      while(isOnBoard(currentMove)){
        if(isSquareEmpty(currentMove, squares)){
          validMoves.push(currentMove);
        } else if(isSquareOccupiedSameColour(currentMove,isWhite, squares)){ 
          break;
        } else{
          validMoves.push(currentMove);
          break;
        }
        currentMove = moveDirection.map((e,i)=>e+currentMove[i]);
      }
    }
    return validMoves;
  }

  let getValidKnightDestinations = (pos, isWhite, squares=currentSquares) => {
    const jumps = [[-2,-1],[-2,1],[-1,2],[1,2],[2,1],[2,-1],[1,-2],[-1,-2]];
    let validMoves = jumps.map( (jump,i) => jump.map( (e,j) => e + pos[j] ) )
                      .filter((move) => isOnBoard(move) && !isSquareOccupiedSameColour(move, isWhite, squares));
    return validMoves;
  }

  let getValidBishopDestinations = (pos, isWhite, squares=currentSquares) => {
    let validMoves = [];
    for(let moveDirection of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      let currentMove = moveDirection.map((e,i)=>e+pos[i]);
      while(isOnBoard(currentMove)){
        if(isSquareEmpty(currentMove, squares)){
          validMoves.push(currentMove);
        } else if(isSquareOccupiedSameColour(currentMove,isWhite,squares)){ 
          break;
        } else{
          validMoves.push(currentMove);
          break;
        }
        currentMove = moveDirection.map((e,i)=>e+currentMove[i]);
      }
    }
    return validMoves;
  }

  let getValidQueenDestinations = (pos, isWhite, squares=currentSquares) => {
    let validMoves = [];
    for(let moveDirection of [[-1,-1],[1,-1],[1,1],[-1,1],[-1,0],[0,-1],[1,0],[0,1]]){
      let currentMove = moveDirection.map((e,i)=>e+pos[i]);
      while(isOnBoard(currentMove)){
        if(isSquareEmpty(currentMove, squares)){
          validMoves.push(currentMove);
        } else if(isSquareOccupiedSameColour(currentMove,isWhite,squares)){ 
          break;
        } else{
          validMoves.push(currentMove);
          break;
        }
        currentMove = moveDirection.map((e,i)=>e+currentMove[i]);
      }
    }
    return validMoves;
  }

  let getValidKingDestinations = (pos, isWhite, squares=currentSquares) => {
    const moves = [[-1,-1],[1,-1],[1,1],[-1,1],[-1,0],[0,-1],[1,0],[0,1]];
    let validMoves = moves.map((move,i)=>move.map((e,j)=>e+pos[j]))
                      .filter((move) => isOnBoard(move) && !isSquareOccupiedSameColour(move, isWhite, squares));
    //TODO: Castling
    if(isWhite&&pos[0]==7&&pos[1]==4){
      //King side
      if(isKingCastleValidWhite&&squares[7][5]==null&&squares[7][6]==null&&squares[7][7]==PIECES.WHITE_ROOK){
        if(!isCheckByColour(squares, !isWhite)
           && !isKingInCheckIfMove([7,4],[7,5],isWhite,squares)
           && !isKingInCheckIfMove([7,4],[7,6],isWhite,squares)){
            validMoves.push([7,6]);
        }
      }
      //Queen side
      if(isQueenCastleValidWhite&&squares[7][3]==null&&squares[7][2]==null&&squares[7][1]==null&&squares[7][0]==PIECES.WHITE_ROOK){
        if(!isCheckByColour(squares, !isWhite)
          && !isKingInCheckIfMove([7,4],[7,3],isWhite,squares)
          && !isKingInCheckIfMove([7,4],[7,2],isWhite,squares)){
           validMoves.push([7,2]);
       }
      }
    }
    if(!isWhite&&pos[0]==0&&pos[1]==4){
      //King side
      if(isKingCastleValidBlack&&squares[0][5]==null&&squares[0][6]==null&&squares[0][7]==PIECES.BLACK_ROOK){
        if(!isCheckByColour(squares, !isWhite)
           && !isKingInCheckIfMove([0,4],[0,5],isWhite,squares)
           && !isKingInCheckIfMove([0,4],[0,6],isWhite,squares)){
            validMoves.push([0,6]);
        }
      }
      //Queen side
      if(isQueenCastleValidBlack&&squares[0][3]==null&&squares[0][2]==null&&squares[0][1]==null&&squares[0][0]==PIECES.BLACK_ROOK){
        if(!isCheckByColour(squares, !isWhite)
          && !isKingInCheckIfMove([0,4],[0,3],isWhite,squares)
          && !isKingInCheckIfMove([0,4],[0,2],isWhite,squares)){
           validMoves.push([0,2]);
       }
      }
    }
    return validMoves;
  }

  let getAllPieceDestinationsForColour = (isWhite, squares=currentSquares) => {
    let result = []
    for(let i=0; i<8; i++){
      for(let j=0; j<8; j++){
        const piece = squares[i][j];
        if(piece && isPieceWhite(piece)==isWhite){
          result.push(...pieceConfig[piece].getValidDestinations([i,j],isWhite, squares));
        }
      }
    }
    return result;
  }

  let isKingInCheckIfMove = (posFrom, posTo, isWhite, squares=currentSquares) => {
    const newSquares = executeMove(posFrom, posTo, squares);
    return isCheckByColour(newSquares, !isWhite);
  }

  let isCheckByColour = (squares=currentSquares, isWhite) => {
    const attackedSquares = getAllPieceDestinationsForColour(isWhite, squares);
    const kingPos = findKing(!isWhite, squares);
    const result = attackedSquares.some((square) => square.toString() == kingPos.toString());
    return result;
  }

  let findKing = (isWhite, squares=currentSquares) => {
    let king = isWhite ? PIECES.WHITE_KING : PIECES.BLACK_KING;
    for(let i = 0; i < 8; i++){
      let kingIndex = squares[i].indexOf(king);
      if(kingIndex >= 0) return [i,kingIndex];
    }
    return [];
  }

  let isPieceWhite = (piece) => piece.charCodeAt(0) <= 0x2659;

  let isOnBoard = pos => pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8 ;

  let isSquareOccupiedOppositeColour = (pos, isWhite, squares=currentSquares) => squares[pos[0]][pos[1]]
                                                          && isPieceWhite(squares[pos[0]][pos[1]]) != isWhite;

  let isSquareOccupiedSameColour = (pos, isWhite, squares=currentSquares) => squares[pos[0]][pos[1]]
                                                      && isPieceWhite(squares[pos[0]][pos[1]]) == isWhite;
           
  let isSquareEmpty = (pos, squares=currentSquares) => squares[pos[0]][pos[1]] == null;

  let isCastleMove = (posFrom, posTo, isWhite, movingPiece) => {
    return isWhite ? 
      ((movingPiece==PIECES.WHITE_KING) && (posTo[0]==7&&(posTo[1]==0||posTo[1]==7||posTo[1]==2||posTo[1]==6)) 
                                        && (posFrom[0]==7&&posFrom[1]==4))
    : ((movingPiece==PIECES.BLACK_KING) && (posTo[0]==0&&(posTo[1]==0||posTo[1]==7||posTo[1]==2||posTo[1]==6)) 
                                        && (posFrom[0]==0&&posFrom[1]==4));
  }

  let updateCastleConditions = pos => {
    if(isKingCastleValidBlack||isQueenCastleValidBlack){
      if(pieceSelected==PIECES.BLACK_KING){
        setIsKingCastleValidBlack(false);
        setIsQueenCastleValidBlack(false);
      } else if(pieceSelected==PIECES.BLACK_ROOK){
        if(pos[1]==0){
          setIsQueenCastleValidBlack(false);
        } else if(pos[1]==1){
          setIsKingCastleValidBlack(false);
        }
      }
    }
    if(isKingCastleValidWhite||isQueenCastleValidWhite){
      if(pieceSelected==PIECES.WHITE_KING){
        setIsKingCastleValidWhite(false);
        setIsQueenCastleValidWhite(false);
      } else if(pieceSelected==PIECES.WHITE_ROOK){
        if(pos[1]==0){
          setIsQueenCastleValidWhite(false);
        } else if(pos[1]==1){
          setIsKingCastleValidWhite(false);
        }
      }
    }
    return;
  }

  let isEnPassantAvailable = (pos, isWhite, squares, isLeft) => {
    const y_dir = isWhite ? -1 : 1;
    const x_dir = isLeft ? -1 : 1;
    const valid_row = isWhite ? 3 : 4;
    if(pos[0]==valid_row && isOnBoard([pos[0],pos[1]+x_dir]) && mostRecentMove[0][0]==pos[0]+(y_dir*2)
        && mostRecentMove[0][1]==pos[1]+x_dir && mostRecentMove[1][0]==pos[0] && mostRecentMove[1][1]==pos[1]+x_dir){
      return true;
    }
    return false;
  }

  let isEnPassantAvailableLeft = (pos, isWhite, squares) => isEnPassantAvailable(pos, isWhite, squares, true);

  let isEnPassantAvailableRight = (pos, isWhite, squares) => isEnPassantAvailable(pos, isWhite, squares, false);

  let isEnPassantMove = (posFrom, posTo, isWhite, movingPiece, squares) => {
    const pawn = isWhite ? PIECES.WHITE_PAWN : PIECES.BLACK_PAWN;
    if(movingPiece==pawn && posFrom[1]!=posTo[1] && squares[posTo[0]][posTo[1]]==null){
      return true;
    }
    return false;
  }

  let executeMove = (posFrom, posTo, squares=currentSquares) => {
    const movingPiece = squares[posFrom[0]][posFrom[1]];
    const isWhite = isPieceWhite(movingPiece);
    const newSquares = cloneDeep(squares);
    newSquares[posFrom[0]][posFrom[1]] = null;
    // Pawn promotion
    if((movingPiece==PIECES.WHITE_PAWN && posTo[0]==0) || (movingPiece==PIECES.BLACK_PAWN && posTo[0]==7)){
      newSquares[posTo[0]][posTo[1]] = isWhite ? PIECES.WHITE_QUEEN : PIECES.BLACK_QUEEN;
    } else if(isCastleMove(posFrom, posTo, isWhite, movingPiece)){ // Castling
      newSquares[isWhite?7:0][posTo[1]<4?0:7] = null;
      newSquares[isWhite?7:0][posTo[1]<4?2:6] = isWhite ? PIECES.WHITE_KING : PIECES.BLACK_KING;
      newSquares[isWhite?7:0][posTo[1]<4?3:5] = isWhite ? PIECES.WHITE_ROOK : PIECES.BLACK_ROOK;
    } else if(isEnPassantMove(posFrom, posTo, isWhite, movingPiece, squares)){ // En passant
      newSquares[posTo[0]][posTo[1]] = movingPiece;
      newSquares[posTo[0]+(isWhite?1:-1)][posTo[1]] = null;
    } else { // Move to open square
      newSquares[posTo[0]][posTo[1]] = movingPiece;
      // TODO: castling, and en passant
    }
    return newSquares;
  };

  let endTurn = () => {
    setAvailableDestinations([]);
    setPieceSelected([]);
    setIsWhiteTurn(!isWhiteTurn);
    return;
  }

  // Config
  const pieceConfig = {
    [PIECES.WHITE_PAWN]: {
      getValidDestinations: getValidPawnDestinations,
    },
    [PIECES.WHITE_ROOK]: {
      getValidDestinations: getValidRookDestinations,
    },
    [PIECES.WHITE_KNIGHT]: {
      getValidDestinations: getValidKnightDestinations,
    },
    [PIECES.WHITE_BISHOP]: {
      getValidDestinations: getValidBishopDestinations,
    },
    [PIECES.WHITE_QUEEN]: {
      getValidDestinations: getValidQueenDestinations,
    },
    [PIECES.WHITE_KING]: {
      getValidDestinations: getValidKingDestinations,
    },
    [PIECES.BLACK_PAWN]: {
      getValidDestinations: getValidPawnDestinations
    },
    [PIECES.BLACK_ROOK]: {
      getValidDestinations: getValidRookDestinations,
    },
    [PIECES.BLACK_KNIGHT]: {
      getValidDestinations: getValidKnightDestinations,
    },
    [PIECES.BLACK_BISHOP]: {
      getValidDestinations: getValidBishopDestinations,
    },
    [PIECES.BLACK_QUEEN]: {
      getValidDestinations: getValidQueenDestinations,
    },
    [PIECES.BLACK_KING]: {
      getValidDestinations: getValidKingDestinations,
    },
  };

  return (
    <div className="App" style={appStyle}>
      <Board 
        squares={currentSquares} 
        onClick={pos => handleClick(pos)}
        selectedSquare={pieceSelected}
        availableDestinations={availableDestinations}
        mostRecentMove={mostRecentMove}
      />
    </div>
  );
}

export default App;
