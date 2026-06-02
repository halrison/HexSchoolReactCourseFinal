function Card ({image, slot}) {    
return (
    <div className="card object-cover">
        {slot.header}
        <img className="vh-25 w-25 mx-auto my-1" src={image.url} alt={image.title} />
        {slot.body}
        {slot.footer}
    </div>
)
}
export default Card