-- Chennai starter stations and exits for EXIT RIGHT
insert into stations (city, name, line_code, latitude, longitude, popularity_index)
values
  ('Chennai', 'Guindy', 'Blue', 13.0089, 80.2127, 0.82),
  ('Chennai', 'Alandur', 'Blue', 13.0046, 80.2013, 0.78),
  ('Chennai', 'Vadapalani', 'Green', 13.0507, 80.2124, 0.75),
  ('Chennai', 'Egmore', 'Green', 13.0808, 80.2614, 0.86),
  ('Chennai', 'CMBT', 'Green', 13.0695, 80.2087, 0.88)
on conflict do nothing;

insert into exit_gates (station_id, gate_code, gate_name, latitude, longitude, road_type, lighting_score)
select s.id, e.gate_code, e.gate_name, e.latitude, e.longitude, e.road_type, e.lighting_score
from (
  values
    ('Guindy', 'G1', 'GST Road Exit', 13.0092, 80.2122, 'main_road', 0.88),
    ('Guindy', 'G2', 'Industrial Estate Exit', 13.0084, 80.2133, 'inner_road', 0.69),
    ('Alandur', 'A1', 'Airport Link Exit', 13.0051, 80.2010, 'main_road', 0.84),
    ('Alandur', 'A2', 'Suburban Exit', 13.0042, 80.2019, 'inner_road', 0.67),
    ('Vadapalani', 'V1', 'Forum Mall Exit', 13.0509, 80.2118, 'main_road', 0.85),
    ('Vadapalani', 'V2', 'Arcot Road Exit', 13.0504, 80.2129, 'main_road', 0.80),
    ('Egmore', 'E1', 'Railway Station Exit', 13.0812, 80.2618, 'main_road', 0.90),
    ('Egmore', 'E2', 'Pantheon Road Exit', 13.0803, 80.2608, 'main_road', 0.79),
    ('CMBT', 'C1', 'Bus Terminus Exit', 13.0698, 80.2092, 'main_road', 0.87),
    ('CMBT', 'C2', '100 Feet Road Exit', 13.0691, 80.2082, 'main_road', 0.82)
) as e(station_name, gate_code, gate_name, latitude, longitude, road_type, lighting_score)
join stations s on s.name = e.station_name
where not exists (
  select 1
  from exit_gates eg
  where eg.station_id = s.id and eg.gate_code = e.gate_code
);

insert into crowd_patterns (station_id, weekday, hour, crowd_level, base_density)
select s.id, c.weekday, c.hour, c.crowd_level, c.base_density
from stations s
cross join (
  values
    (1, 8, 'HIGH', 0.82),
    (1, 19, 'HIGH', 0.80),
    (1, 13, 'MEDIUM', 0.55),
    (6, 10, 'MEDIUM', 0.50),
    (6, 20, 'LOW', 0.32)
) as c(weekday, hour, crowd_level, base_density)
where not exists (
  select 1
  from crowd_patterns cp
  where cp.station_id = s.id and cp.weekday = c.weekday and cp.hour = c.hour
);
