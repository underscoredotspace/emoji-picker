import React from 'react'
import ReactDOM from 'react-dom'
import Clipboard from 'clipboard'
import './index.css'
import emojisJson from '../public/emojis.json'

class EmojiPicker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      isLoaded: false,
      emojis: [],
      emojiCategory: '',
      filterText: '',
      toastText: ''
    }
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
    this.handleCategoryChange = this.handleCategoryChange.bind(this)
    this.handleClipboardCopyEvent = this.handleClipboardCopyEvent.bind(this)
    this.clipboard = new Clipboard('BUTTON.emoji')
    
    this.clipboard.on('success', this.handleClipboardCopyEvent)
  }

  handleClipboardCopyEvent(e) {
    this.setState({toastText: `${e.text} copied to clipboard`})
    e.clearSelection()
    setTimeout(() => {
      this.setState({toastText: ''})
    }, 2000)
  }

  handleFilterTextChange(filterText) {
    this.setState({filterText})
  }

  handleCategoryChange(emojiCategory) {
    this.setState({emojiCategory})
  }

  componentDidMount() {
    const emojis = emojisJson
      .filter(e => e.emoji)   // Remove those silly non-emojis
      .map(emoji => {         // Merge aliases to tags for search
        emoji.tags = emoji.tags.concat(emoji.aliases)
        delete emoji.aliases
        return emoji
      })
      
    this.setState({
      isLoaded: true,
      emojis
    })
  }

  render() {
    const {error, isLoaded, emojis, emojiCategory, filterText, toastText} = this.state
    
    if (error) {
      console.error(error.message)
      return (
        <div className='emoji-picker'>
          <div className='emoji-categories'>
            <button className='emoji-category'><span role="img" aria-label="upside-down face emoji">🙃</span></button>
          </div>
          <div className='emojis-nomatch'>Error</div>
        </div>
      )
    } else if (!isLoaded) {
      return (
        <div className='emoji-picker'>
          <div className='emoji-categories'></div>
          <div className='emojis-nomatch'>Loading...</div>
        </div>
      )
    } else {
      return (
        <div className='emoji-picker'>
          <EmojiTypes onCategoryChange={this.handleCategoryChange} emojiCategory={emojiCategory} />
          <EmojiSearch onFilterTextChange={this.handleFilterTextChange} filterText={filterText}/>
          <EmojiToast toastText={toastText}/>
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

class EmojiToast extends React.Component {
  render() {
    let toastText = this.props.toastText

    if (toastText !== '') {
      return (
        <div className='emoji-toast'>
          {toastText}
        </div>
      )
    } else {
      return ('')
    }
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
      return (
        <button 
          onClick={this.handleEmojiClick} 
          className='emoji' 
          title={emoji.description} 
          key={`emoji-${ndx}`}
          data-clipboard-text={emoji.emoji}>
            {emoji.emoji}
        </button>
      )
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