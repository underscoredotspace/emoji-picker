import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

class EmojiPicker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      emojis: [],
      emojiCategory: '',
      filterText: ''
    }
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
    this.handleCategoryChange = this.handleCategoryChange.bind(this)
  }

  handleFilterTextChange(filterText) {
    this.setState({filterText})
  }

  handleCategoryChange(emojiCategory) {
    this.setState({emojiCategory})
  }

  componentDidMount() {
    fetch('emojis.json').then(res => res.json())
    .then(res => res.filter(emoji => emoji.emoji)) // Remove those silly non-emojis
    .then(res => res.map(emoji => { // Merge aliases to tags for search
      emoji.tags = emoji.tags.concat(emoji.aliases)
      delete emoji.aliases
      return emoji
    }))
    .then(res => {
        this.setState({
          isLoaded: true,
          emojis: res
        })
      }, error => {
        this.setState({
          isLoaded: true,
          error
        })
      }
    )
  }

  render() {
    const {error, isLoaded, emojis, emojiCategory, filterText} = this.state
    
    if (error) {
      console.error(error.message)
      return (
        <div className='emoji-picker'>
          <div className='emoji-categories'>
            <button className='emoji-category'>🙃</button>
          </div>
          <div className='emoji-list'>
            <div className='emojis-nomatch'>Error</div>
          </div>
        </div>
      )
    } else if (!isLoaded) {
      return (
        <div className='emoji-picker'>
          <div className='emoji-categories'></div>
          <div className='emoji-list'>
            <div className='emojis-nomatch'>Loading...</div>
          </div>
        </div>
      )
    } else {
      return (
        <div className='emoji-picker'>
          <EmojiTypes onCategoryChange={this.handleCategoryChange} emojiCategory={emojiCategory} />
          <EmojiSearch onFilterTextChange={this.handleFilterTextChange} filterText={filterText}/>
          <EmojiList emojiCategory={emojiCategory} filterText={filterText} emojis={emojis} />
        </div>
      )
    }
  }
}

class EmojiTypes extends React.Component {
  constructor(props) {
    super(props)
    this.emojiTypes = [
      {category:'People', emoji:'😀'}, 
      {category:'Nature', emoji:'🌸'}, 
      {category:'Foods', emoji:'🍔'}, 
      {category:'Activity', emoji:'🎾'}, 
      {category:'Places', emoji:'🚂'}, 
      {category:'Objects', emoji:'📌'}, 
      {category:'Symbols', emoji:'♻️'}, 
      {category:'Flags', emoji:'🏁'}
    ]
    this.handleCategoryChange = this.handleCategoryChange.bind(this)
  }

  handleCategoryChange(e, key) {
    this.props.onCategoryChange(key)
  }

  render() {
    const emojiCategory = this.props.emojiCategory

    return (
      <div className='emoji-categories emoji-section'>
        <button className='emoji-category all' onClick={e=>this.handleCategoryChange(e)}>&#11089;</button>
        {this.emojiTypes.map(emojiType => {
          let selected = ''
          if (emojiType.category === emojiCategory) selected = ' selected'
          return (<button className={'emoji-category'+selected} onClick={e=>this.handleCategoryChange(e,emojiType.category)} key={emojiType.category}>
            {emojiType.emoji}
          </button>)
        }
        )}
      </div>
    )
  }
}

class EmojiSearch extends React.Component {
  constructor(props) {
    super(props)
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
  }
  
  handleFilterTextChange(e) {
    this.props.onFilterTextChange(e.target.value)
  }

  render() {
    return (
      <input
        className='emoji-search'
        type="search"
        placeholder='Search'
        value={this.props.filterText}
        onChange={this.handleFilterTextChange}
      />
    )
  }
}

class EmojiList extends React.Component {
  render() {
    const filterText = this.props.filterText.toLowerCase()
    const emojiCategory = this.props.emojiCategory
    let emojis = this.props.emojis
    let matches = false

    if (emojiCategory) {
      emojis = emojis.filter(emoji => emoji.category === emojiCategory)
    }

    let emojisFiltered = emojis.map((emoji, ndx) => {
      if ((emoji.description && emoji.description.toLowerCase().indexOf(filterText) === -1) &&
         (emoji.tags.length > 0 && emoji.tags.filter(tag => tag.toLowerCase().indexOf(filterText) !== -1).length === 0)) {
          return false
      }
      if (!matches) matches = true
      return (<div className='emoji' title={emoji.description} key={`emoji-${ndx}`}>
        {emoji.emoji}
      </div>)
    })

    if (!matches) {
      emojisFiltered = <div className='emojis-nomatch'>No matches</div>
    }

    return (
      <div className='emoji-list'>
        {emojisFiltered}
      </div>
    )
  }
}

ReactDOM.render(
  <EmojiPicker />,
  document.getElementById('root')
)