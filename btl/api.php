<?php
if (isset($_POST['functionname'])) {
    $paPDO = initDB();
    $paSRID = '4326';
    $paPoint = [];
    if (isset($_POST['paPoint']))
        $paPoint = $_POST['paPoint'];
    $functionname = $_POST['functionname'];
    $table = ['gadm36_vnm_1', 'gadm36_vnm_2', 'gadm36_vnm_3'];
    $layer = $_POST['layer'];
    $stringSearch = '';
    if (isset($_POST['stringSearch']))
        $stringSearch = $_POST['stringSearch'];

    $result = "null";
    switch ($functionname) {
        case 'getGeoCMRToAjax':
            $result = getGeoCMRToAjax($paPDO, $paSRID, $paPoint, $table[$layer]);
            break;
        case 'getInfoCMRToAjax':
            $result = getInfoCMRToAjax($paPDO, $paSRID, $paPoint, $table[$layer]);
            break;
        case 'searchPlace':
            $result = getPlace($paPDO, $table[$layer], $layer+1, $stringSearch);
            break;
    }
    echo $result;
    closeDB($paPDO);
}

function initDB()
{
    // Kết nối CSDL
    $paPDO = new PDO('pgsql:host=localhost;dbname=btl;port=5432', 'postgres', '123456');
    return $paPDO;
}

function query($paPDO, $paSQLStr)
{
    try {
        // Khai báo exception
        $paPDO->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Sử đụng Prepare 
        $stmt = $paPDO->prepare($paSQLStr);
        // Thực thi câu truy vấn
        $stmt->execute();

        // Khai báo fetch kiểu mảng kết hợp
        $stmt->setFetchMode(PDO::FETCH_ASSOC);

        // Lấy danh sách kết quả
        $paResult = $stmt->fetchAll();
        return $paResult;
    } catch (PDOException $e) {
        echo "Thất bại, Lỗi: " . $e->getMessage();
        return null;
    }
}
function closeDB($paPDO)
{
    // Ngắt kết nối
    $paPDO = null;
}

//to mau
function getGeoCMRToAjax($paPDO, $paSRID, $paPoint, $tableName)
{
    $paPoint = str_replace(',', ' ', $paPoint);
    $mySQLStr = "SELECT ST_AsGeoJson(geom) as geo from \"$tableName\" where ST_Within('SRID=" . $paSRID . ";" . $paPoint . "'::geometry,geom)";

    $result = query($paPDO, $mySQLStr);

    if ($result != null)
        return $result[0]['geo'];
    else
        return "null";
}

//lay thong tin
function getInfoCMRToAjax($paPDO, $paSRID, $paPoint, $tableName)
{
    $result = null;
    $paPoint = str_replace(',', ' ', $paPoint);
    switch ($tableName) {
        case 'gadm36_vnm_1':
            $mySQLStr = "SELECT json_build_object('type_1', type_1, 'name_1',name_1, 'dien_tich', ST_Area(geom, false)/1000000, 'chu_vi', ST_Perimeter(geom, false)) as obj from $tableName where ST_Within('SRID=$paSRID; $paPoint '::geometry,geom)";
            $result = query($paPDO, $mySQLStr);
            break;
        case 'gadm36_vnm_2':
            $mySQLStr = "SELECT json_build_object('name_1',name_1,'type_2', type_2, 'name_2', name_2, 'dien_tich', ST_Area(geom, false)/1000000, 'chu_vi', ST_Perimeter(geom, false)) as obj from $tableName where ST_Within('SRID=$paSRID; $paPoint '::geometry,geom)";
            $result = query($paPDO, $mySQLStr);
            break;
        case 'gadm36_vnm_3':
            $mySQLStr = "SELECT json_build_object('name_1',name_1, 'name_2', name_2,'type_3',type_3,'name_3',name_3, 'dien_tich', ST_Area(geom, false)/1000000, 'chu_vi', ST_Perimeter(geom, false)) as obj from $tableName where ST_Within('SRID=$paSRID; $paPoint '::geometry,geom)";
            $result = query($paPDO, $mySQLStr);
            break;
    }

    if ($result != null)
        return $result[0]['obj'];
    else
        return "{}";
}

function getPlace($paPDO, $tableName, $layer, $stringSearch)
{
    $result = null;
    $mySQLStr = "SELECT ST_AsGeoJson(geom) as geo from $tableName where name_$layer like '$stringSearch' or varname_$layer like '$stringSearch'";
    $result = query($paPDO, $mySQLStr);
    if ($result != null)
        return $result[0]['geo'];
    else
        return "[]";
}
