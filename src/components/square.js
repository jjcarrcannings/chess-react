import '../styles/square.css'

const boardSquareStyles = {
    aspectRatio: '1/1',
    width: '100%',
    height: '100%',
    fontSize: '5vw',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
}

function Square({pos, isWhite, piece=null, isSelected=false, isValidDestination=false, onClick, mostRecentMove}) {
    let backgroundColor;
    if(isSelected || mostRecentMove) {
        backgroundColor = '#FFFF6E';
    } else {
        backgroundColor = isWhite ? "#fff8dc" : "#cdaa7d";
    }
    return(
        <div className="square" style={Object.assign({}, boardSquareStyles, {backgroundColor})} onClick={onClick}>
            <div className="square__available-destination">
                {isValidDestination ? "•" : null}      
            </div>
            <div className="square__piece">
                {piece}
            </div>
        </div>
    )
}

export default Square;