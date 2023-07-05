import { useEffect, useState } from "react";
import "./styles.css";
import list from "./list.json";

export default function App() {
  const [itemList, setItemList] = useState([]);
  const [searchPlaceHolder, setSearchPlaceHolder] = useState("");
  const [showDropbox, setShowDropbox] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const listCopy = structuredClone(list);

    (function recursion(subList, parent) {
      subList.forEach((each) => {
        each.parent = parent;
        each.isExpanded = true;
        recursion(each.children, each);
      });
    })(listCopy);

    setItemList(listCopy);
  }, []);

  const handleSelect = (subList, nextSelectState) => {
    let newSearchPlaceHolder = [],
      searchPlaceHolderLength = 0,
      hiddenWordCount = 0;

    (function recursionInward(subList) {
      subList.isPartiallySelected = subList.isSelected = nextSelectState;
      subList.children.forEach(recursionInward);
    })(subList);

    (function recursionOutward(subList) {
      if (!subList.parent) return;
      subList.parent.isSelected = subList.parent.children.every(
        ({ isSelected }) => isSelected
      );

      subList.parent.isPartiallySelected = subList.parent.children.some(
        (a) => a.isPartiallySelected || a.isSelected
      );

      recursionOutward(subList.parent);
    })(subList);

    (function dfsList(subList) {
      subList.forEach((each) => {
        if (!each.isSelected) return dfsList(each.children);

        if (searchPlaceHolderLength + each.value.length < 30) {
          newSearchPlaceHolder.push(each.value);
          searchPlaceHolderLength += each.value.length;
        } else {
          hiddenWordCount++;
        }
      });
    })(itemList);

    setSearchPlaceHolder(
      newSearchPlaceHolder.join(", ") +
        (hiddenWordCount ? `  +${hiddenWordCount} more..` : "")
    );
    setItemList([...itemList]);
    setSelectAll(itemList.every(({ isSelected }) => isSelected));
  };

  const handleClear = () => {
    (function updateSelectedValues(subList) {
      subList.forEach((each) => {
        each.isPartiallySelected = each.isSelected = false;
        updateSelectedValues(each.children);
      });
    })(itemList);

    setSearchPlaceHolder("");
    setSelectAll(false);
    setShowDropbox(!showDropbox);
  };

  const handleSelectAll = () => {
    itemList.forEach((each) => handleSelect(each, !selectAll));
  };

  const handleDropbox = () => {
    setShowDropbox((prevDropBoxState) => !prevDropBoxState);
  };

  const handleExpand = (item) => {
    console.log(item);
    item.isExpanded = !item.isExpanded;
    setItemList([...itemList]);
  };

  return (
    <div>
      <h4>Grouping with CheckBox</h4>
      <div className="app">
        <div
          onClick={handleDropbox}
          className={`search-box ${showDropbox ? "selected" : ""}`}
        >
          <div className={searchPlaceHolder ? "selected-text" : ""}>
            {searchPlaceHolder || "Select Places"}
          </div>
          <div className="search-icons">
            {searchPlaceHolder && (
              <div onClick={handleClear} className="clear-icon">
                &#10006;
              </div>
            )}
            <div
              className={`dropdown-arrow ${
                showDropbox ? "dropdown-arrow-rotate" : ""
              }`}
            >
              &#9699;
            </div>
          </div>
        </div>
        <div className={`dropbox ${showDropbox ? "show" : ""}`}>
          <div className="select-all">
            <div
              onClick={() => handleSelectAll(itemList)}
              className={`checkbox ${selectAll ? "checked" : ""}`}
            ></div>
            {selectAll ? "Unselect All" : "Select All"}
          </div>
          <List
            handleSelect={handleSelect}
            handleExpand={handleExpand}
            subItemList={itemList}
            level={0}
            key="1"
          />
        </div>
      </div>
    </div>
  );
}

const List = ({ handleSelect, handleExpand, subItemList, level }) => {
  return (
    <div className={level > 0 ? "value-sub-list" : "value-list"}>
      {subItemList.map((item) => {
        const {
          value,
          children,
          isSelected,
          isPartiallySelected,
          isExpanded,
          id
        } = item;

        return (
          <>
            <div className="single-value">
              <div
                className="expand-colapse"
                onClick={() => handleExpand(item)}
              >
                {children.length > 0 &&
                  (isExpanded ? <>&#8722;</> : <>&#43;</>)}
              </div>
              <div
                onClick={() => handleSelect(item, !isSelected)}
                className={`checkbox ${
                  isSelected
                    ? "checked"
                    : isPartiallySelected
                    ? "partial-tick"
                    : ""
                }`}
              ></div>
              {value}
            </div>
            {isExpanded && (
              <List
                handleSelect={handleSelect}
                handleExpand={handleExpand}
                subItemList={children}
                level={level + 1}
                key={id}
              />
            )}
          </>
        );
      })}
    </div>
  );
};
