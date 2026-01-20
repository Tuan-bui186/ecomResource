import React from 'react';

const MessageParser = ({ children, actions }) => {
    // console.log(children.props.state)
    const { checker } = children.props.state;
    const parse = (message) => {
        if (checker === "search") {
            actions.afterNameMessage();
            children.props.state.userData.name = message;
        }

        if (checker === "preference" && String(message)) {
            actions.afterAgeMessage();
            children.props.state.userData.age = message;
            if (message == "Giày" || message == "giày" || message == "GIÀY") {
                children.props.state.userData.category = "shoe";
            } else if (message == "Áo" || message == "áo" || message == "ÁO"|| message == "mua áo"|| message == "tôi cần mua áo"|| message == "MUA ÁO") {
                children.props.state.userData.category = "shirt";
            }
            else if (message == "Túi" || message == "túi" || message == "TÚI") {
                children.props.state.userData.category = "bag";
            } else {
                children.props.state.userData.category = "default";
            }
        }
    }
    return (
        <div>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    parse: parse,
                    actions,
                });
            })}
        </div>
    );
};

export default MessageParser;