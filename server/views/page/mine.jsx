'use strict';

import React, { Component } from 'react';



class HomePage extends Component {
  render () {

    return (
        <div>
          <ul>
              <li style={style.test}>首页</li>
              <li>第一个</li>
              <li>第二个</li>
              <li>第三个</li>
              <li>第四个</li>
            <button><a href="./">返回首页</a></button>
          </ul>
          <hr/>
        </div>
  );
  }
}

const style = {}
style.test = {
  backgroundColor:'red'
}

export default HomePage;
