setTimeout(init, 3000)
setInterval(watchChannel, 3000)

const urlPattern = /^https:\/\/(.+)\.dooray\.com\/profile-image\/(\d+);/i
const subDomainPattern = /^https:\/\/(.+)\.dooray\.com/i
const hiPattern = /안녕하세요/i
const groupStartIdx = 2
let subDomain
let meUid

/**
 * @key: memberId
 */
const watchMemberMap = {}

/**
 * @key: memberId
 * @value: channelId
 */
const channelMap = {}

function createUUID(){
  let dt = new Date().getTime()

  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random()*16)%16 | 0
      dt = Math.floor(dt/16)
      return (c=='x' ? r :(r&0x3|0x8)).toString(16)
  }) 

  return uuid
}

function watchChannel() {
  const memberIdList = Object.keys(watchMemberMap)
  memberIdList.forEach(memberId => {
    handleDoorayChannelMessageList(channelMap[memberId].channelId)
  })
}

async function postDoorayMessage(channelId) {
  const res = await fetch(`https://${subDomain}.dooray.com/messenger/v1/api/channelLogs/${channelId}`, {
    method: 'POST',
    headers: {
       'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify({ text: '안녕하세요.', token: createUUID() })
 })
 const data = await res.json()
 return data
}

async function handleDoorayChannelMessageList(channelId) {
  const res = await fetch(`https://${subDomain}.dooray.com/messenger/v1/api/channel/${channelId}/logs?limit=50&setLastChannel=true`)
  const data = await res.json()

  if(!data.header.isSuccessful) {
    return
  }

  const logs = data.result.content.logs
  if(logs.length == 0) {
    return
  }

  if(logs[logs.length - 1].senderId === meUid) {
    return
  }

  if(!hiPattern.test(logs[logs.length - 1].text)) {
    return
  }

  await postDoorayMessage(channelId)
}

async function handleDoorayChannel() {
  const res = await fetch(`https://${subDomain}.dooray.com/messenger/v1/api/members/me/favorites?responseType=all&flags=system,normal,archived`)
  const data = await res.json()
  if(!data.header.isSuccessful) {
    return
  }

  data.result.content.channels
    .filter(channel => channel.type == 'direct')
    .forEach(channel => {
      meUid = channel.memberId
      channel.members
        .filter(memberId => meUid !== memberId)
        .forEach(otherId => {
          channelMap[otherId] = {
            channelId: channel.channelId
          }
        })
    })
}

function getChannelId(src) {
  if(urlPattern.test(src)) {
    const res = urlPattern.exec(src)
    subDomain = res[1]
    return res[2]
  }
  return undefined
}

function changeAutoResponse() {
  if(this.checked) {
    watchMemberMap[this.memberId] = ''
    return
  }
  delete watchMemberMap[this.memberId]
}

function createGroupCheckbox(memberId) {
  const checkbox = document.createElement('input')
  checkbox.title = '자동응답체크'
  checkbox.type = 'checkbox'
  checkbox.name = 'autoResponse'
  checkbox.style = 'margin-right: 10px;'
  checkbox.memberId = memberId
  checkbox.addEventListener('change', changeAutoResponse)
  return checkbox
}

function setSubDomain() {
  subDomain = subDomainPattern.exec(location.href)[1]
}

function init() {
  setSubDomain()
  handleDoorayChannel()

  const messengerGroup = document.getElementsByClassName('ReactVirtualized__Grid__innerScrollContainer')
  const messengerGroupItem = messengerGroup[0]

  messengerGroupItem.childNodes.forEach(
    (group, index) => {
      if(index < groupStartIdx) {
        return
      }
      const groupTextWrap = group.children[0].children[0].children[1]
      const imgList = group.getElementsByTagName('img')
      if(imgList.length === 0) {
        return
      }
  
      const memberId = getChannelId(imgList[0].src)
      if(memberId) {
        groupTextWrap.appendChild(createGroupCheckbox(memberId))
        return
      }
    }
  )
}
