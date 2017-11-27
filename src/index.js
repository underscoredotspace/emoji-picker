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
      filterText: ''
    }
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
  }

  handleFilterTextChange(filterText) {
    this.setState({filterText})
  }

  componentDidMount() {
    fetch("emojis.json").then(res => res.json())
    .then(res => {
      res.forEach(emoji => {
        emoji.tags.concat(emoji.aiases)
        delete emoji.aliases
      })
      return res
    })
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
    const {error, isLoaded, emojis, filterText} = this.state;
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <div className="emoji-picker">
          <EmojiSearch onFilterTextChange={this.handleFilterTextChange} filterText={filterText}/>
          <EmojiList filterText={filterText} emojis={emojis} />
        </div>
      )
    }
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
        type="text"
        placeholder="Search..."
        value={this.props.filterText}
        onChange={this.handleFilterTextChange}
      />
    )
  }
}

class EmojiList extends React.Component {
  render() {
    const filterText = this.props.filterText

    return (
      <div className='emoji-list'>
        {this.props.emojis.map((emoji, ndx) => {
          if (
            (emoji.description && emoji.description.indexOf(filterText) === -1)
          ) {
            return false
          }
          return (<div className='emoji' title={emoji.description} key={`emoji-${ndx}`}>
            {emoji.emoji}
          </div>)
        })}
      </div>
    )
  }
}

ReactDOM.render(
  <EmojiPicker />,
  document.getElementById('root')
)