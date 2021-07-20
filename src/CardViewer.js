import React from "react";
import "./CardViewer.css"

import { Link, withRouter } from "react-router-dom";
import { firebaseConnect, isLoaded, isEmpty } from "react-redux-firebase";
import { connect } from "react-redux";
import { compose } from "redux";


/**
 * The CardViewer component allows users to view their flashcard set.
 * They can flip the cards to view both sides, as well as randomize
 * the card order. The arrow keys can also be used to navigate through
 * the set.
 */
class CardViewer extends React.Component {
    constructor(props) {
        super(props);
        /**
         * The "currIndex" state stores the current index of the card 
         * being displayed in the viewer. Display is the side of the 
         * card being displayed, and localCards is a copy of the "cards"
         * prop passed by the parent App component. Having a local copy
         * of the cards makes randomization much easier. "display" is 
         * initialized as null to avoid errors when props.cards has not
         * finished loading from Firebase.
         */

        this.state = {
            currIndex: 0,
            display: null,
            localCards: props.cards,
        }
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    /**
     * Switches the currently displayed card to the previous card in the
     * card list.
     */
    prevCard = () => {
        this.setState({
            currIndex: this.state.currIndex - 1,
            display: this.state.localCards[this.state.currIndex - 1].front,
        });
    };

    /**
     * Switches the currently displayed card to the next card in the 
     * card list.
     */
    nextCard = () => {
        this.setState({
            currIndex: this.state.currIndex + 1,
            display: this.state.localCards[this.state.currIndex + 1].front,
        });
    };

    /**
     * "Flips" the currently displayed card when the card is clicked.
     */
    flipCard = () => {
        const front = this.state.localCards[this.state.currIndex].front;
        const back = this.state.localCards[this.state.currIndex].back;
        if (this.state.display === front) {
            this.setState({ display: back });
        } else {
            this.setState({ display: front });
        }
    };

    /**
     * Randomizes the local card list and then displays the first card
     * in the new list. The shuffle algorithm is based off the Durstenfeld
     * shuffle.
     */
    randomizeCards = () => {
        const cards = this.state.localCards.slice();
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        // setState with callback, as second setState relies on first
        this.setState({ localCards: cards }, function () {
            this.setState({
                currIndex: 0,
                display: this.state.localCards[0].front
            });
        });
    };

    /**
     * Handles right or left arrow keydown events to move to the next
     * or previous card.
     */
    handleKeydown = event => {
        if (event.code === "ArrowRight" &&
            this.state.currIndex < this.state.localCards.length - 1) {
            this.nextCard();
        } else if (event.code === "ArrowLeft" &&
            this.state.currIndex > 0) {
            this.prevCard();
        }
    };

    /**
     * Updates the state if anything has changed (i.e., on data load
     * from Firebase). 
     */
    componentDidUpdate(prevProps) {
        if (this.props.cards !== prevProps.cards) {
            this.setState({
                localCards: this.props.cards,
                display: this.props.cards[0].front
            });
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeydown, false);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeydown, false);
    }

    render() {
        // Handle wait time till loaded props and invalid deckId
        if (!isLoaded(this.props.cards)) {
            return <div>Loading...</div>;
        }
        if (isEmpty(this.props.cards)) {
            return <div>Page not found!</div>;
        }

        let progress = "Progress: " + (this.state.currIndex + 1) +
            "/" + (this.props.cards.length) + " cards";

        return (
            <div>
                <h2>{this.props.name}</h2>
                <br />
                <div>{progress}</div>
                <br />
                <div id="description">
                    Click card to flip, and use left/right
                    arrow keys to navigate to previous/next card.
                </div>
                <br />
                <button onClick={this.randomizeCards}>Randomize</button>
                <div
                    id="card"
                    onClick={this.flipCard}
                >
                    {this.state.display}
                </div>
                <button
                    disabled={this.state.currIndex <= 0}
                    onClick={this.prevCard}
                >
                    Prev
                </button>
                <button
                    disabled={this.state.currIndex >= this.props.cards.length - 1}
                    onClick={this.nextCard}
                >
                    Next
                </button>
                <hr />
                <Link to="/">Home</Link>
            </div>
        );
    }
}

/**
 * Maps the deck from redux global state to the CardViewer 
 * component props.
 */
const mapStateToProps = (state, props) => {
    const deck = state.firebase.data[props.match.params.deckId];
    const name = deck && deck.name;
    const cards = deck && deck.cards;
    return { cards: cards, name: name };
};

export default compose(
    withRouter,
    firebaseConnect(props => {
        const deckId = props.match.params.deckId;
        return [{ path: `/flashcards/${deckId}`, storeAs: deckId }];
    }),
    connect(mapStateToProps),
)(CardViewer);