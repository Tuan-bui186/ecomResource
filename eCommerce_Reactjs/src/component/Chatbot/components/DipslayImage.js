import React from 'react'

export default function DipslayImage(props) {
    const { product } = props.state.userData;
    return (
        <div>
            {product.map((item, index) => (
                <div className='img-component' key={index}>
                    <a href={item.link} target='_blank' rel="noreferrer">{item.name}</a>
                    <div className='img-container'>
                        <img src={item.imageUrl} />
                    </div>
                </div>
            ))}
        </div>
    )
}