import React from 'react'

export default function StartSlow(props) {
    const category = props.state.userData.category;
    const product = [];
    Object.keys(props.state.data[category]).forEach((key) => {
        product.push(key);
    });

    const preference = (preference) => {
        const { name, age } = props.state.userData;
        const category = props.state.userData.category;
        const product = props.state.data[category][preference];
        props.state.userData.product = product;
        props.actions.finalResult(name, age, preference, product.name);
    }

    const listItems = product.map((item) =>
        <button className='start-btn slow-btn' onClick={() => preference(`${item}`)}>{item}</button>
    );

    return (
        <div>
            {listItems}
        </div >
    )
}