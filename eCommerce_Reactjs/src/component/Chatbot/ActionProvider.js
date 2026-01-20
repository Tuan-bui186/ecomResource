import React from 'react';

const ActionProvider = ({ createChatBotMessage, setState, children }) => {

    const initialAction = () => {
        const message = createChatBotMessage('Bạn cần mua gì?');
        // updateState(message, "search")
        updateState(message, "preference")
    }

    const afterNameMessage = () => {
        const message = createChatBotMessage("Bạn muốn mua của thương hiệu nào?")
        updateState(message, "preference")
    }

    const afterAgeMessage = () => {
        const message = createChatBotMessage(`Đây là các thương hiệu bạn nên tham khảo!`, {
            widget: "startSlow"
        })
        updateState(message)
    }

    const finalResult = (name, search, preference, vehicle) => {
        const message = createChatBotMessage(`Những sản phẩm bạn cần tìm`, {
            widget: "finalImage"
        })
        updateState(message)
    }

    const updateState = (message, checker) => {
        setState((prev) => ({
            ...prev,
            messages: [...prev.messages, message],
            checker,
        }))
    }

    return (
        <div>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    actions: {
                        initialAction,
                        afterNameMessage,
                        afterAgeMessage,
                        finalResult
                    },
                });
            })}
        </div>
    );
};

export default ActionProvider;