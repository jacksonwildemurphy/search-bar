import React from "react";
import {Menu, MenuDivider, MenuHeader, MenuItem, Typeahead} from 'react-bootstrap-typeahead';
import {groupBy, map} from 'lodash';
import * as LibraryActions from "../../actions/LibraryActions"
import DbGameStore from "../../stores/DbGameStore";


export default class Searchbar extends React.Component {

  constructor(props) {
      super(props);
      this.setSearchList = this.setSearchList.bind(this);
      this.renderMenu = this.renderMenu.bind(this);

      this.state = {
        disabled: false,
        minLength: 2,
        selectHintOnEnter: false,
        dbGameList: [{id: 0, name: "Games not yet loaded", type: "games"}],
        listData: [{id: 1, name: "Games and people not yet loaded", type: "games"}]
      };

      LibraryActions.getAllGames();

    }

    componentWillMount() {
        DbGameStore.on("change", this.setSearchList);
    }

    componentWillUnmount() {
        DbGameStore.removeListener("change", this.setSearchList);
    }

    // merge games and people into a single list
    setSearchList(){
      this.setState({
          dbGameList: DbGameStore.getAll()
      });
      if(this.state.dbGameList == null){
        console.log("db game was not yet initialized")
        return;
      }
      var dbGameList = this.state.dbGameList;
      console.log(" size of game list: " + dbGameList.length)
      var peopleList = [{name: "logangsta"},
          {name: "jacksonmeister"},
          {name: "kelpaso"},
          {name: "weetermachine"}
      ];

      var gamesAndPeopleList = [];

      var id = 0;
      for(id; id < dbGameList.length; id++){
        gamesAndPeopleList.push(dbGameList[id]);
        gamesAndPeopleList[id].id = id;
        gamesAndPeopleList[id].name = dbGameList[id].title;

        gamesAndPeopleList[id].type = "games";
        console.log("game added to list")
      }

      var peopleListIdx = 0;
      for(id; id < (dbGameList.length + peopleList.length); id++, peopleListIdx++){
        gamesAndPeopleList.push(peopleList[peopleListIdx]);
        gamesAndPeopleList[id].id = id;
        gamesAndPeopleList[id].type = "people";
        console.log("person added to list")
      }

      console.log("the game/people list was successfully initialized and has size: " + gamesAndPeopleList.length)

      this.setState({listData: gamesAndPeopleList})
}

    handleChange(){
      console.log("a search item was selected")
    }

    renderMenu(results, menuProps) {
      console.log("renderMenu was executed")
      let idx = 0;
      const grouped = groupBy(results, r => r.type); // type is "games" or "people"
      const items = Object.keys(grouped).sort().map(type => {
        return [
          !!idx && <MenuDivider key={`${type}-divider`} />,
          <MenuHeader key={`${type}-header`}>
            {type}
          </MenuHeader>,
          map(grouped[type], listObj => {
            const item =
              <MenuItem key={idx} option={listObj} position={idx}>
                {listObj.name}
              </MenuItem>;

            idx++;
            return item;
          }),
        ];
      });

      return <Menu {...menuProps}>{items}</Menu>;
  }

    render() {
      const {
        disabled,
        emptyLabel,
        minLength,
        selectHintOnEnter,
      } = this.state;

      const props = {};
      props.renderMenu = this.renderMenu;

      var myData = [
        {id: 1, name: 'FIFA 16', type: 'games'},
        {id: 2, name: 'Titanfall', type: 'games'},
        {id: 3, name: 'Nuka', type: 'games'},
        {id: 4, name: 'Subnautica', type: 'games'},
        {id: 5, name: 'FIFA 17', type: 'games'},
        {id: 6, name: 'jacksonmeister', type: 'people'},
        {id: 7, name: 'logangsta', type: 'people'},
        {id: 8, name: 'weetermachine', type: 'people'},
        {id: 9, name: 'kelpaso', type: 'people'},
        {id: 10, name: 'loser', type: 'people'},
        {id: 11, name: 'weakling', type: 'people'},
        {id: 12, name: 'klutzGamer', type: 'people'},
      ];

      var listData = this.state.listData

      return (
        <div>
          <Typeahead
            {...props}
            emptyLabel={emptyLabel ? '' : undefined}
            labelKey="name"
            options={listData}
            placeholder="Search..."
            onChange={this.handleChange}


          />
        </div>
      )
    }
  }
