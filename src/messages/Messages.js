class Messages {
    static OP_MOVE_PLAYER = (x, y) => { return { op: 'OP_MOVE_PLAYER', x, y }; };
    static OP_BALL_COLLIDE = (x, y) => { return { op: 'OP_BALL_COLLIDE', x, y }; };
    static OP_GAME_INVITE = (name, gameStatus) => { return { op: 'OP_GAME_INVITE', name, gameStatus }; };
    static OP_GAME_INVITE_RESPONSE = (yesOrNo) => { return { op: 'OP_GAME_INVITE_RESPONSE', yesOrNo }; };
    static OP_DUMMY_MESSAGE = (text) => { return { text: text }; };
}

export default Messages;